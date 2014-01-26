
require('colors');

var Connection = require('ssh2'),
    deploy = require('./'),
    Q = require('q'),
    fs = require('fs'),
    path = require('path'),
    logger = require('./logger');

Shell = function () {};


function loadLocalFile (file) {
    file = path.normalize(file);
    return Q.nfcall(fs.readFile, file).then(function (data) {
        return  data;
    }).fail(function () {
        return file;
    });
}

Shell.prototype.connect = function (config) {
    var fileLoading = [],
        deferred = Q.defer(),
        self = this;
    this.connection = new Connection();

    if(config.privateKey && typeof config.privateKey === 'string') {
        promise = loadLocalFile(config.privateKey);
        promise.then(function(content) {
            config.privateKey = content;
        });
        fileLoading.push(promise);
    }
    if(config.publicKey && typeof config.publicKey === 'string') {
        promise = loadLocalFile(config.publicKey);
        promise.then(function(content) {
            config.publicKey = content;
        });
        fileLoading.push(promise);
    }

    Q.all(fileLoading).done(function () {
        self.connection.on('banner', function (text) {
            self.banner = text;
        });

        self.connection.on('ready', function () {
            logger.debug('Connected to server');
            self.connected = true;
            if (self.banner) {
                logger.debug('\n' + self.banner);
            }
            deferred.resolve(self);
        });

        self.connection.on('error', function(err) {
            logger.error(err);
            deferred.reject(err);
        });

        self.connection.connect(config);
    });
    return deferred.promise;
};

Shell.prototype.exec = function (cmd, cwd) { // take cwd in charge !!!!
    var results = {out: '', stdout: '', stderr: '', status: ''},
        deferred = Q.defer();

    if (!this.connected) {
        throw Error("shell not yet connected");
    }

    this.connection.exec(cmd, function(err, stream) {
        if (err) throw err;

        stream.on('data', function(data, extended) {
            results.out += data;
            if (extended === 'stdout') {
                results.stdout += data;
            } else {
                results.stderr += data;
            }
        });

        function done () {
            if(results.ended && results.code !== undefined) {
                if (results.code === 0) {
                    logger.info('exec', "'" + cmd + "'", '\n');
                    logger.debug('\n', results.out);
                    deferred.resolve(results);
                } else {
                    logger.error("'" + cmd + "'", 'return', results.code);
                    logger.debug('\n', results.out);
                    deferred.reject('wrong exit code ' + results.code + ' ' + results.description);
                }
            }
        }

        stream.on('exit', function(code, signal, didCoreDump, description) {
            results.code = code;
            results.status = (results.code === 0?'success':'failure');
            results.description = description;
            done();
        });

        stream.on('end', function() {
            results.ended = true;
            done();
        });
    });
    return deferred.promise;
};

Shell.prototype.sudo = function(cmd, cwd) {
    return this.exec("sudo " + cmd, cwd);
};

Shell.prototype.disconnect = function () {
    this.connection.end();
};

function resolveCallback (callback, args) {
    if (!callback) {
        return;
    }
    if (!Array.isArray(args)) {
        args = [args];
    }
    return Q.fapply(callback, args);
}

Shell.prototype.profile = function () {
    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop(); // last argument
    var promises = [];

    for (var i in args) {
        var name = args[i];
        if (!deploy.profiles[name]) {
            throw Error(name + ' not registered');
        }
        if (deploy.profiles[name].profile) {
            // already initialized, resolve callback
            promises.push(deploy.profiles[name].profile);
        }else {
            var init = deploy.profiles[name].init;
            promises.push(Q.fcall(init, this));
        }
    }

    return Q.all(promises).then(function (results) {
        for (var i in results) {
            var profile = results[i];
            var name = args[i];
            if (!('profile' in deploy.profiles[name])) {
                deploy.profiles[name].profile = profile;
            }
        }
        return resolveCallback(callback, results);
    });
};

module.exports = Shell;

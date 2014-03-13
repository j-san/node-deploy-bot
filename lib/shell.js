
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

    if (typeof config === 'string') {
        if (!(config in deploy.config)) {
            throw Error('Unknown config ' + config);
        }
        config = deploy.config[config];
    }

    this.name = config.username + '@' + config.host;

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
        deferred = Q.defer(),
        self = this;

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
                    logger.info('exec', self.name, "'" + cmd + "'", 'OK');
                    logger.verbose('output:', '\n', results.out, '\n---------------');
                    deferred.resolve(results);
                } else {
                    logger.error('exec', self.name, "'" + cmd + "'", 'NOT OK return code', results.code);
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

Shell.prototype.run = function () {
    var promises = [];

    for (var i in arguments) {
        var name = arguments[i];
        if (!deploy.tasks[name]) {
            throw Error(name + ' not registered');
        }

        var run = deploy.tasks[name].run;
        promises.push(Q.fcall(run, this));
    }

    // TODO run in series
    return Q.all(promises);
};

module.exports = Shell;

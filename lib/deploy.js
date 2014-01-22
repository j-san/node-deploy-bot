
require('colors');

var Connection = require('ssh2'),
    winston = require('winston'),
    Q = require('q'),
    fs = require('fs'),
    path = require('path'),
    profiles = {};

var logger = new (winston.Logger)({
    transports: [new (winston.transports.Console)({
        level: 'debug',
        colorize: true
    })]
});

Shell = function (connection) {
    this.connection = connection;
};

Shell.prototype.exec = function (cmd, cwd) { // take cwd in charge !!!!
    var results = {out: '', stdout: '', stderr: '', status: ''},
        deferred = Q.defer();

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
                logger.info('exec', cmd, results.status, '\n', results.out);
                if (results.code === 0) {
                    deferred.resolve(results);
                } else {
                    logger.error('wrong exit code', results.code);
                    deferred.reject('wrong exit code ' + results.code + ' ' + results.description);
                }
            }
        }

        stream.on('exit', function(code, signal, didCoreDump, description) {
            results.code = code;
            results.status = (results.code === 0?'success'.green:'failure'.red);
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
        if (!profiles[name]) {
            throw Error(name + ' not registered');
        }
        if (profiles[name].profile) {
            // already initialized, resolve callback
            promises.push(profiles[name].profile);
        }else {
            var init = profiles[name].init;
            promises.push(Q.fcall(init, this));
        }
    }

    return Q.all(promises).then(function (results) {
        for (var i in results) {
            var profile = results[i];
            var name = args[i];
            if (!('profile' in profiles[name])) {
                profiles[name].profile = profile;
            }
        }
        return resolveCallback(callback, results);
    });
};

function loadPrivateKey (options, callback) {
    if(options.privateKey && typeof options.privateKey === 'string') {
        // read content of file if exists, else it is an inline pk
        fs.readFile(path.normalize(options.privateKey), function (err, data) {
            if (err) {
                callback(options);
            } else {
                options.privateKey = data;
                callback(options);
            }
        });
    } else {
        callback(options);
    }
}
function connect (options, callback) {
    var connection = new Connection(),
        shell = new Shell(connection),
        deferred = Q.defer();

    loadPrivateKey(options, function (config) {
        connection.connect(config);

        connection.on('banner', function (text) {
            shell.banner = text;
        });
        connection.on('ready', function () {
            logger.debug('Connected to server');
            if (shell.banner) {
                logger.debug('\n' + shell.banner);
            }
            resolveCallback(callback, shell).then(function () {
                deferred.resolve(shell);
            }, function (err) {
                deferred.reject(err);
            });
        });

        connection.on('error', function(err) {
            logger.error(err);
        });
    });

    return deferred.promise;
}


function registerProfile (name, init) {
    profiles[name] = {init: init};
}

exports.logger = logger;
exports.connect = connect;
exports.registerProfile = registerProfile;

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

function resolveCallback (callback, args, deferred) {
    if (!callback) {
        return;
    }
    if (!Array.isArray(args)) {
        args = [args];
    }
    var valueOrPromise = callback.apply(null, args);
    if(valueOrPromise.then === 'function') {
        valueOrPromise.then(function(o) {
            deferred.resolve(o);
        },function(reason) {
            deferred.reject(reason);
        });
    } else {
        deferred.resolve(valueOrPromise);
    }
}

Shell.prototype.profile = function (name, callback) {
    var deferred = Q.defer();
    if (profiles[name].profile) {
        // already initialized, resolve callback
        resolveCallback(callback, profiles[name].profile, deferred);
    }
    var init = profiles[name].init;
    var valueOrPromise = init(this);
    if (typeof valueOrPromise.then === 'function'){
        valueOrPromise.done(function (profile) {
            profiles[name].profile = profile;
            resolveCallback(callback, profile, deferred);
        });
    } else {
        profiles[name].profile = valueOrPromise;
        resolveCallback(callback, valueOrPromise, deferred);
    }
    return deferred.promise;
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
            logger.info('Connected to server');
            if (shell.banner) {
                logger.debug('\n' + shell.banner);
            }
            resolveCallback(callback, shell, deferred);
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

var Connection = require('ssh2'),
    winston = require('winston'),
    Q = require('q'),
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

Shell.prototype.profile = function (name, callback) {
    var deferred = Q.defer();
    var init = profiles[name];
    init(this, function (profile) {
        var promise = callback(profile);
        if(promise) {
            promise.then(function(o) {
                deferred.resolve(o);
            },function(reason) {
                deferred.reject(reason);
            });
        }
    });
    return deferred.promise;
};

function connect (config, callback) {
    var connection = new Connection(),
        shell = new Shell(connection),
        deferred = Q.defer();
    connection.connect(config);

    connection.on('banner', function (text) {
        shell.banner = text;
    });
    connection.on('ready', function () {
        logger.info('Connected to server');
        if (shell.banner) {
            logger.debug('\n' + shell.banner);
        }
        var promise = callback(shell);
        if(promise) {
            promise.then(function(o) {
                deferred.resolve(o);
            },function(reason) {
                deferred.reject(reason);
            });
        }
    });

    connection.on('error', function(err) {
        logger.error(err);
    });

    return deferred.promise;
}

function registerProfile (name, init) {
    profiles[name] = init;
}

exports.logger = logger;
exports.connect = connect;
exports.registerProfile = registerProfile;

var deploy = require("../deploy");
var Q = require("q");

FileSystem = function(shell, sftp) {
    this.shell = shell;
    this.sftp = sftp;
};

/**
 * options:
 * - content String
 * - owner String
 * - permissions Integer
 * - template String path to ejs template
 */
FileSystem.prototype.file = function (path, options, variables) {

    return readFile(this.sftp, path).then(function (file) {
        if (options) {
            return writeFile(this.sftp, path, file, options);
        } else {
            return file;
        }
    // }).fail(function () {
        // file does not exists => create it
    });
};

function readFile (sftp, path) {
    var shell = this.shell,
        file = {content: ''};

    return Q.all([
        Q.ninvoke(sftp, 'stat', path),
        Q.ninvoke(sftp, 'readFile', path)
    ]).then(function (results) {

        file.stat = results[0];
        file.content += results[1];
        return file;
    });
}

function writeFile (sftp, path, file, newFile) {
    var promises = [];
    if (newFile.content && file.content != newFile.content) {
        promises.push(Q.ninvoke(this.sftp, 'writeFile', path, newFile.content));
    }
    if ((newFile.owner && file.owner != newFile.owner) ||
            (newFile.group && file.group != newFile.group)) {
        promises.push(Q.ninvoke(this.sftp, 'chown', path, newFile.owner, newFile.group));
    }
    if (newFile.permissions && file.permissions != newFile.permissions) {
        promises.push(Q.ninvoke(this.sftp, 'chmod', path, newFile.permissions));
    }
    // fire event "file-changed:" + path
    return Q.all(promises).then(function (results) {
        // update file obj
        return file;
    });
}

FileSystem.prototype.dir = function (path){};
FileSystem.prototype.fileLine = function (path, line) {};
FileSystem.prototype.envFile = function (path, vars) {};

function init (shell) {
    var deferred = Q.defer();
    shell.connection.sftp(function (err, sftp) {
        if (err) {
            deferred.reject(err);
        } else {
            var fs = new FileSystem(shell, sftp);
            deferred.resolve(fs);
        }

    });
    return deferred.promise;
}

deploy.registerProfile('filesystem', init);
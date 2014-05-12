
var Q = require("q"),
    logger = require('./logger');

function FileSystem (shell) {
    this.shell = shell;
}

/**
 * descriptor:
 * - content String
 * - owner String
 * - permissions Integer
 * - template String path to ejs template
 */
FileSystem.prototype.file = function (path, descriptor) {
    var self = this;

    return this._connect().then(function () {
        return readFile(self.sftp, path);
    }).then(function (file) {
        if (descriptor) {
            return self.shell.sudo('touch ' + path).then(function () {
                return self.shell.sudo('chmod 777 ' + path);
            }).then(function () {
                return writeFile(self.sftp, path, file, descriptor);
            });

        } else {
            return file;
        }
    }).then(function () {
        logger.info('File %s uploaded', path);
    });
};

FileSystem.prototype.directory = function (path, descriptor) {
    descriptor.directory = true;
    return this.file(path, descriptor);
};

FileSystem.prototype._connect = function () {
    var self = this;
    if (!this.sftpPromise) {
        this.sftpPromise = Q.ninvoke(this.shell.connection, 'sftp').then(function (sftp) {
            self.sftp = sftp;
        });
    }
    return this.sftpPromise;
};

function readFile (sftp, path) {
    var file = {content: ''};

    return Q.all([
        Q.ninvoke(sftp, 'stat', path),
        Q.ninvoke(sftp, 'readFile', path)
    ]).then(function (results) {

        file.stat = results[0];
        file.content += results[1];
        return file;
    }).fail(function () {
        // file does not exists
        return {};
    });
}

function writeFile (sftp, path, file, newFile) {
    var promises = [];
    if (newFile.content && file.content !== newFile.content) {
        promises.push(Q.ninvoke(sftp, 'writeFile', path, newFile.content));
    }
    if ((newFile.owner && file.owner !== newFile.owner) ||
            (newFile.group && file.group !== newFile.group)) {
        promises.push(Q.ninvoke(sftp, 'chown', path, newFile.owner, newFile.group));
    }
    if (newFile.permissions && file.permissions !== newFile.permissions) {
        promises.push(Q.ninvoke(sftp, 'chmod', path, newFile.permissions));
    }
    // fire event "file-changed:" + path
    return Q.all(promises).then(function () {
        // update file obj
        return file;
    });
}

module.exports = FileSystem;

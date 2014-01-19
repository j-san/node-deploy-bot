
var deploy = require("../deploy");

FileSystem = function(shell) {
    this.shell = shell;
};

FileSystem.prototype.write = function writeFile (path, content, owner, access) {
    return this.read(path).then(function (file) {
        if (file.content != content ||
            file.owner != owner ||
            file.access != access) {
        }
    });
    // fire event "file-changed:" + path
};
FileSystem.prototype.read = function readFile (path) {
    var shell = this.shell, file = {};
    return shell.exec('cat ' + path).then(function (results) {
        file.content = results.out;
        return shell.exec('ls -l ' + path);
    }).then(function (results) {
        parts = /(\w)(\w{9}) \d (\w+) (\w+) .*/;
        //       type access     user  group
    }).fail(function  (reason) {
        // file not found ??
    });
};

FileSystem.prototype.mkdir = function (path){};
FileSystem.prototype.ls = function (path){};
FileSystem.prototype.ensureLine = function (path, line) {};
FileSystem.prototype.envVars = function (path, vars) {};
FileSystem.prototype.template = function (path, template, vars) {
    // ejs
};

function init (shell) {
    var file = new FileSystem(shell);
    return file;
}

deploy.registerProfile('filesystem', init);
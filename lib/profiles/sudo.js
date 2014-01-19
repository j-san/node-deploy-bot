
var deploy = require("../deploy");

function Sudo (shell) {
    this.shell = shell;
}

Sudo.prototype.exec = function(cmd, cwd) {
    return this.shell.exec("sudo " + cmd, cwd);
};

// Sudo.prototype.profile = Shell.prototype.profile;

function init (shell, callback) {
    var sudoShell = new Sudo(shell);
    return sudoShell;
}

deploy.registerProfile('sudo', init);

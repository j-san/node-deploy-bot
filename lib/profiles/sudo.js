
var deploy = require("../deploy");

function Sudo (shell) {
    this.shell = shell;
}

Sudo.prototype.exec = function(cmd, cwd) {
    return this.shell.exec("sudo " + cmd, cwd);
};

function init (shell, callback) {
    var sudoShell = new Sudo(shell);
    callback(sudoShell);

    // sudo.connection.shell(function() {
    //     sudo.connection.exec("sudo su", function(err, stream) {
    //         if (err) throw err;

    //         stream.on('end', function() {
    //             console.log('end');
    //         });
    //         callback(sudo);
    //     });
    // });
}

deploy.registerProfile('sudo', init);

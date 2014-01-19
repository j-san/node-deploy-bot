
var deploy = require("../deploy");
var Q = require("q");

function Yum () {}

Yum.prototype.install = function(lib) {
    return this.shell.exec('yum install ' + lib);
};

function init (shell, callback) {
    var yum = new Yum();
    shell.exec('yum --version').done(function (results) {
        yum.version = results.out.split('\n')[0];
        shell.profile('sudo', function (su) {
            yum.shell = su;
            callback(yum);
        });
    });
}

deploy.registerProfile('yum', init);


var deploy = require("../deploy");
var Q = require("q");

function Yum () {}

Yum.prototype.install = function(lib) {
    return this.shell.exec('yum install ' + lib);
};

function init (shell) {
    var yum = new Yum();
   return  shell.exec('yum --version').then(function (results) {
        yum.version = results.out.split('\n')[0];
        return shell.profile('sudo', function (su) {
            yum.shell = su;
            return yum;
        });
    });
}

deploy.registerProfile('yum', init);

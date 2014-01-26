
var deploy = require("./");
var Q = require("q");

function Yum (shell) {
    this.shell = shell;
}

Yum.prototype.install = function() {
    // don't lets 2 intall at a time, rememer last promise
    var queue = Q(),
        self = this,
        promise;
    for (var i in arguments) {
        lib = arguments[i];
        queue = queue.then(function () {
            return self.shell.sudo('yum install ' + lib);
        });
    }
    return queue;
};

Yum.prototype.ensure = function () {
    var self = this;
   return  this.shell.exec('yum --version').then(function (results) {
        self.version = results.out.split('\n')[0];
        return self;
    });
};

module.exports = Yum;

var deploy = require("./");
var Q = require("q");
var util = require('util');

function PackageManager (shell) {
    this.shell = shell;
}

PackageManager.install_cmds = {
    yum: 'yum install %s',
    apt: 'apt-get install %s',
    npm: 'npm install -g %s',
    pip: 'pip install %s',
    gem: 'gem install %s',
    brew: 'brew install %s',
    pacman: 'pacman install %s'
};
PackageManager.ensure_cmds = {
    yum: 'yum --version',
    apt: 'apt-get --version',
    npm: 'npm --version',
    pip: 'pip --version',
    gem: 'gem --version',
    brew: 'brew --version',
    pacman: 'pacman --version'
};

PackageManager.prototype.install = function(provider, pkg) {
    // don't lets 2 intall at a time, rememer last promise
    if (!this.queue) {
        this.queue = Q();
    }
    var cmd = util.format(PackageManager.cmds[provider], pkg);
    return this.queue.then(function () {
        return this.shell.sudo(cmd);
    });
};

PackageManager.prototype.packages = function(provider, pkgs) {
    var queue = Q(),
        self = this,
        promise;

    for (var i in pkgs) {
        pkg = pkgs[i];
        this.install(provider, cmd);
    }
    return this.queue;
};

PackageManager.prototype.ensure = function () {
    var self = this;
   return  this.shell.exec('yum --version').then(function (results) {
        self.version = results.out.split('\n')[0];
        return self;
    });
};

module.exports = Yum;
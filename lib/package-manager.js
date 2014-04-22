
var Q = require("q");
var util = require('util');

function PackageManager (shell) {
    this.shell = shell;
}

PackageManager.install_cmds = {
    yum: 'yum install -y %s',
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
    var self = this;
    // don't lets 2 intall at same time, rememer last promise
    if (!this.queue) {
        this.queue = Q();
    }
    var cmd = util.format(PackageManager.install_cmds[provider], pkg);
    this.queue = this.queue.then(function () {
        return self.shell.sudo(cmd);
    });
};

PackageManager.prototype.packages = function(provider, pkgs) {
    for (var i in pkgs) {
        var pkg = pkgs[i];
        this.install(provider, pkg);
    }
    return this.queue;
};

PackageManager.prototype.ensure = function (provider) {
    var cmd = PackageManager.ensure_cmds[provider];

   return  this.shell.exec(cmd).then(function (results) {
        var version = results.out.split('\n')[0];
        return version;
    });
};

module.exports = PackageManager;
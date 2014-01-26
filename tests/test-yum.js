
var deploy = require('../lib'),
    Yum = require('../lib/yum'),
    Shell = require('../lib/shell'),
    fs = require('fs'),
    path = require('path'),
    Q = require('q'),
    should = require('should'),
    privateKey = fs.readFileSync(process.env.HOME + '/.vagrant.d/insecure_private_key');


var shell = new Shell(),
    yum = new Yum(shell),
    done = false;
shell.connect({
    host: 'localhost',
    port: 2222,
    username: 'vagrant',
    privateKey: privateKey
}).then(function () {
    return shell.exec('echo "lets start!"');
}).then(function () {
    return yum.ensure();
}).then(function (yum) {
    console.log(yum.version);
    return yum.install('git', 'mercurial');
}).then(function () {
    console.log('yum.version');
    return [
        shell.exec('git --version'),
        shell.exec('hg --version')
    ];
}).then(function () {
    console.log('done');
    done = true;
}).finally(function () {
    shell.disconnect();
}).fail(function (error) {
    console.error(error.stack || error);
    process.exit(1);
}).done(function () {
    done.should.equal(true);
    process.exit();
});

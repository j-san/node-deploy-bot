
var Shell = require('../lib/shell'),
    should = require('should');


var shell = new Shell(),
    done = false;

shell.connect('vagrant').then(function () {
    return shell.exec('echo "lets start!"');
}).then(function () {
    return shell.ensure('yum');
}).then(function (version) {
    console.log(version);
    return shell.install('yum', ['git', 'mercurial']);
}).then(function () {
    return [
        shell.exec('git --version'),
        shell.exec('hg --version')
    ];
}).then(function () {
    console.log('done');
    done = true;
}).fail(function (error) {
    console.error(error.stack || error);
    process.exit(1);
}).done(function () {
    shell.disconnect();
    done.should.equal(true);
    process.exit();
});

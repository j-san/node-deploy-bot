

require('colors');

var deploy = require('../lib'),
    Shell = require('../lib/shell'),
    should = require('should'),
    Q = require('q');


var done = false;

var shell = new Shell();
shell.connect('vagrant').then(function () {
    console.log('connected');
    return Q.all([
        shell.exec('sleep 1'),
        shell.exec('uptime')
    ]);
}).then(function () {
    return shell.exec('uname -a');
}).then(function () {
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

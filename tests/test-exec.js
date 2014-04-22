

require('colors');

var Shell = require('../lib/shell'),
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
}).done(function () {
    done.should.equal(true);
    shell.disconnect();
});

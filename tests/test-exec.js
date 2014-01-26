

require('colors');

var deploy = require('../lib'),
    should = require('should'),
    Q = require('q');


var done = false;

var shell = new Shell();
shell.connect({
    host: 'localhost',
    port: 2222,
    username: 'vagrant',
    privateKey: process.env.HOME + '/.vagrant.d/insecure_private_key'
}).then(function () {
    console.log('connected');
    return Q.all([
        shell.exec('sleep 1'),
        shell.exec('uptime')
    ]).then(function () {
        return shell.exec('uname -a');
    }).then(function () {
        done = true;
    }).finally(function () {
        shell.disconnect();
    });
}).fail(function (error) {
    console.error(error.stack || error);
    process.exit(1);
}).done(function () {
    done.should.equal(true);
    process.exit();
});

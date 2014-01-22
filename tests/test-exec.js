

require('colors');

var deploy = require('../lib'),
    fs = require('fs'),
    Q = require('q');


deploy.connect({
    host: 'localhost',
    port: 2222,
    username: 'vagrant',
    privateKey: process.env.HOME + '/.vagrant.d/insecure_private_key'
}, function (shell) {
    return Q.all([
        shell.exec('sleep 1'),
        shell.exec('uptime')
    ]).then(function () {
        return shell.exec('echo "hello"');
    }).fail(function (error) {
        console.error(error.stack || error);
    }).then(function () {
        shell.disconnect();
        process.exit();
    });
});

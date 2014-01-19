

require('colors');

var deploy = require('../lib'),
    fs = require('fs'),
    Q = require('q'),
    privateKey = fs.readFileSync('/home/jsanchezpando/.vagrant.d/insecure_private_key');


deploy.connect({
    host: 'localhost',
    port: 2222,
    username: 'vagrant',
    privateKey: privateKey
}).then(function (shell) {
    return Q.all([
        shell.exec('sleep 1'),
        shell.exec('uptime')
    ]).then(function () {
        return shell.exec('echo "hello"');
    });
}).fail(function (error) {
    console.error('sometgins went wrong...');
    console.error(error.stack || error);
}).then(function () {
    deploy.disconnect();
    process.exit();
});

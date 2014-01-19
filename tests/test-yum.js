

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
}, function (shell) {
    return shell.exec('echo "lets start!"').then(function () {
        return shell.profile('yum', function (yum) {
            console.log(yum.version);
            return yum.install('hello');
        });
    }).fail(function (error) {
        console.error('sometgins went wrong...');
        console.error(error.stack || error);
    }).then(function () {
        shell.disconnect();
        process.exit();
    });
});
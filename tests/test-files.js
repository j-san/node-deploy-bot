

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
    return shell.profile('filesystem', function (fs) {
        return fs.read('/etc/hosts');
    }).then(function (file) {
        console.log(file);
        //return fs.write('/etc/hosts');
    }).fail(function (error) {
        console.error(error.stack || error);
    }).then(function () {
        shell.disconnect();
        process.exit();
    });
});
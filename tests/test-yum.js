
var deploy = require('../lib'),
    // Shell = require('../lib'),
    fs = require('fs'),
    path = require('path'),
    Q = require('q'),
    privateKey = fs.readFileSync(process.env.HOME + '/.vagrant.d/insecure_private_key');


var shell = new Shell();
shell.connect({
    host: 'localhost',
    port: 2222,
    username: 'vagrant',
    privateKey: privateKey
}).then(function () {
    return shell.exec('echo "lets start!"').then(function () {
        return shell.profile('yum', function (yum) {
            console.log(yum.version);
            return yum.install('nodejs');
        });
    }).finally(function () {
        shell.disconnect();
    });
}).fail(function (error) {
    console.error(error.stack || error);
}).done(function () {
    process.exit();
});

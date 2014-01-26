
var deploy = require('../lib'),
    Q = require('q');

var shell = new Shell();
shell.connect({
    host: 'localhost',
    port: 2222,
    username: 'vagrant',
    privateKey: process.env.HOME + '/.vagrant.d/insecure_private_key'
}).then(function () {
    return shell.profile('filesystem', function (fs) {
        return fs.file('/etc/hosts');
    }).then(function (file) {
        //console.log(file);
        //return fs.write('/etc/hosts');
    }).finally(function () {
        shell.disconnect();
    });
}).fail(function (error) {
    console.error(error.stack || error);
}).done(function () {
    process.exit();
});

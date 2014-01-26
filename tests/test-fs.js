
var deploy = require('../lib'),
    Shell = require('../lib/shell'),
    FileSystem = require('../lib/filesystem'),
    Q = require('q');

var shell = new Shell();
var fs = new FileSystem(shell);
shell.connect({
    host: 'localhost',
    port: 2222,
    username: 'vagrant',
    privateKey: process.env.HOME + '/.vagrant.d/insecure_private_key'
}).then(function () {
    return fs.ensure();
}).then(function (file) {
    return fs.file('/etc/hosts');
}).then(function (file) {
    //console.log(file);
    //return fs.write('/etc/hosts');
}).finally(function () {
    shell.disconnect();
}).fail(function (error) {
    console.error(error.stack || error);
    process.exit(1);
}).done(function () {
    process.exit();
});

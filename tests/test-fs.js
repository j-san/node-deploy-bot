
var Shell = require('../lib/shell'),
    FileSystem = require('../lib/filesystem');

var shell = new Shell();
var fs = new FileSystem(shell);
shell.connect('vagrant').then(function () {
    return fs.ensure();
}).then(function () {
    return fs.file('/etc/hosts');
}).then(function () {
    //console.log(file);
    //return fs.write('/etc/hosts');
}).done(function () {
    shell.disconnect();
});

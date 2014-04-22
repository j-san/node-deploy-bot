var Shell = require('deploy-bot/shell');

var cwd = '/home/user/myproject';

var shell = new Shell();
shell.connect('host', function () {
    return [
        shell.exec('mkdir -p ' + cwd + '/var/log/'),
        shell.exec('git clone git@github.com:you/myproject ' + cwd)
    ];
}).all().then(function () {
    return shell.exec('make install', cwd);
}).then(function () {
    return shell.exec(cwd + 'myproject/bin/run');
}).done(function () {
    shell.disconnect();
});
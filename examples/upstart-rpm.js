var bot = require('../lib');

bot.reguisterTask('install-rpm', function(shell) {
    return shell.install(shell.host.state.packageName);
});

bot.reguisterTask('install-service', function(shell) {
    return Q([
        shell.install('nginx', 'postgresql'),
        shell.file.envFile('/home/user/env', {
            DB_HOST: 'localhost',
            DB_USER: 'user',
            EVIRONMENENT: 'staging'
        }),
        shell.file.addline('/home/user/.bashrc', 'source ~/env'),
        shell.file.upstart('/etc/init/myproject.conf', {
            script: '/bin/myproject run',
        })
    ]).all().then(function () {
        shell.exec('initctl start myproject');
    });
});
shell.connect('host', function (shell) {
    return shell.install('nginx', 'postgres');
}).then(function () {
    return [
        shell.file.envFile('/home/user/env', {
            DB_HOST: 'localhost',
            DB_USER: 'user',
            EVIRONMENENT: 'staging'
        }),
        shell.file.addline('/home/user/.bashrc', 'source ~/env'),
        shell.file.upstart('/etc/init/myproject.conf', {
            script: '/bin/myproject run',
        })
    ];
}).all().then(function () {
    exec('initctl start myproject');
}).done(function () {
    shell.disconnect();
});
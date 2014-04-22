bot.reguisterTask('mongo-server-install', function(shell) {
    return Q.all([
        shell.install('yum', ['mongo', 'mongo-server']),
        shell.file.templateFile('/etc/mongod.conf')
    ]).then(function () {
        return shell.sudo('mongod -f /etc/mongod.conf');
    })
});

bot.reguisterTask('mongo-server-restart', function(shell) {
    /* ... */
});
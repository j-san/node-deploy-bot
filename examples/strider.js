var Q = require("q");
var bot = require('..');

bot.registerTask('strider-install', function(shell) {
    return shell.run('mongodb-install').then(function () {
        return shell.install('npm', 'strider');
    });
});

bot.registerTask('strider-restart', function(shell) {
});

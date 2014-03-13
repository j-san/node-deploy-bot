var deploy = require('../');

deploy.registerTask('uptime', function (shell) {
    return shell.exec('uptime');
});

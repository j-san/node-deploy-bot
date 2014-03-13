var deploy = require('../');

deploy.registerTask('sleep', function (shell) {
    return shell.exec('sleep 5');
});

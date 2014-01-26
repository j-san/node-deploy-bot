

var deploy = require('../lib'),
    Shell = require('../lib/shell');

var shell = new Shell();

shell.connect(deploy.conf).then(function () {
    shell.profile('?');
}).finally(function () {
    shell.disconnect();
}).fail(function (error) {
    console.error(error.stack || error);
    process.exit(1);
}).done(function () {
    process.exit();
});

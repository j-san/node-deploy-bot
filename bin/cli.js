#!/usr/bin/env node

var deploy = require('../lib'),
    Shell = require('../lib/shell'),
    pkg = require('../package'),
    program = require('commander');

function list(val) {
  return val.split(',');
}
program
    .version(pkg.version)
    .usage('[options] <hosts>', 'A list of server config')
    .option('-r, --run <tasks>', 'A list of tasks to run', list)
    .parse(process.argv);



function run (host, task) {
    var shell = new Shell();
    shell.connect(host).then(function () {
        shell.run(task);
    }).finally(function () {
        shell.disconnect();
    }).fail(function (error) {
        console.error(error.stack || error);
    });
}
for (var i in program.args) {
    run (program.args[i], program.run || 'uptime');
}

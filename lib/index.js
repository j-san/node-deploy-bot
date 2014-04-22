
var logger = require("./logger"),
    fs = require("fs"),
    _ = require('underscore');

//Q.longStackSupport = true;

var deploy = {
    tasks: {},
    config: {
        vagrant: {
            host: 'localhost',
            port: 2222,
            username: 'vagrant',
            privateKey: process.env.HOME + '/.vagrant.d/insecure_private_key'
        }
    },
    logger: logger,
    registerTask: function (name, run) {
        this.tasks[name] = {run: run};
    },
    configure: function (config) {
        _.extend(this.config, config);
    }
};

var content;
try {
    content = fs.readFileSync('/etc/deploy-bot.json');
    deploy.configure(JSON.parse(content));
} catch (err) {}
try {
    content = fs.readFileSync(process.cwd() + '/deploy-bot.json');
    deploy.configure(JSON.parse(content));
} catch (err) {}

module.exports = deploy;

require("./tasks");

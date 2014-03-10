
var logger = require("./logger"),
    Q = require("q"),
    fs = require("fs"),
    _ = require('underscore');

Q.longStackSupport = true;

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
    registerTask: function (name, init) {
        this.tasks[name] = {init: init};
    },
    configure: function (config) {
        _.extend(this.config, config);
    }
};
try {
    content = fs.readFileSync(process.cwd() + '/deploy-bot.json');
    deploy.configure(JSON.parse(content));
} catch (err) {}

module.exports = deploy;

var logger = require("./logger"),
    fs = require("fs"),
    _ = require('underscore');

var bot = {
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
    },
    getConfig: function (name) {
        if (!(name in bot.config)) {
            throw Error('Unknown config ' + name);
        }
        return bot.config[name];
    }
};

var content;
try {
    content = fs.readFileSync('/etc/deploy-bot.json');
    bot.configure(JSON.parse(content));
} catch (err) {}
try {
    content = fs.readFileSync(process.cwd() + '/bot-bot.json');
    bot.configure(JSON.parse(content));
} catch (err) {}

module.exports = bot;

require("./tasks");

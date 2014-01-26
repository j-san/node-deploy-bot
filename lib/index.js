
var logger = require("./logger"),
    Q = require("q");

Q.longStackSupport = true;

module.exports = {
    profiles: {},
    configuration: {},
    logger: logger,
    registerProfile: function (name, init) {
        this.profiles[name] = {init: init};
    },
    configure: function (configuration) {
        this.configuration = configuration;
    }
};
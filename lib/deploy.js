

module.exports = {
    profiles: {},
    configuration: {},
    registerProfile: function (name, init) {
        this.profiles[name] = {init: init};
    },
    configure: function (configuration) {
        this.configuration = configuration;
    }
};
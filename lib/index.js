

var deploy = require("./deploy");
require("./profiles/yum");
require("./profiles/sudo");
require("./profiles/filesystem");

module.exports = deploy;
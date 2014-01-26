

var deploy = require("./deploy");
var logger = require("./logger");
var Shell = require("./shell");
require("./profiles/yum");
require("./profiles/sudo");
require("./profiles/filesystem");

deploy.logger = logger;
deploy.Shell = Shell;
module.exports = deploy;
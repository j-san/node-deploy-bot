
var deploy = require("../deploy");

function Auth (shell) {
    this.shell = shell;
}

Auth.prototype.user = function(user) {
    // sync user with obj param, always return fetched obj
};

module.exports = Auth;
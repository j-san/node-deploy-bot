
var deploy = require('../lib'),
    Shell = require('../lib/shell'),
    Q = require('q'),
    sinon = require('sinon'),
    should = require('should');

var done = 0;

deploy.registerProfile('test-return-1', function (shell) {
    return 123;
});
deploy.registerProfile('test-return-2', function (shell) {});
deploy.registerProfile('test-delayed', function initTestDelayed (shell) {
    return Q.delay(234, 200);
});
spiedCallback = sinon.spy(function init () {
    return 42;
});
deploy.registerProfile('test-spy', spiedCallback);

var shell = new Shell();
shell.connect({
    host: 'localhost',
    port: 2222,
    username: 'vagrant',
    privateKey: process.env.HOME + '/.vagrant.d/insecure_private_key'
}).then(function () {

    return shell.profile('test-spy', function (profile) {
        return shell.profile('test-delayed', function (profile) {
            return shell.profile('test-spy', function (profile) {
                spiedCallback.called.should.equal(true);
                spiedCallback.callCount.should.equal(1);
                done++;
            });
        });
    }).then(function () {
        return [
            shell.profile('test-return-1', function (profile) {
                profile.should.equal(123);
                done++;
            }),
            shell.profile('test-delayed', function (profile) {
                profile.should.equal(234);
                done++;
            }),
            shell.profile('test-return-2', function (profile) {
                should(profile).equal(undefined);
                done++;
            })
        ];
    }).then(function () {
        return shell.profile('test-return-1', 'test-return-2', 'test-delayed', function (test1, test2, delayed) {
            test1.should.equal(123);
            should(test2).equal(undefined);
            delayed.should.equal(234);
            done++;
        });
    }).finally(function () {
        shell.disconnect();
    });
}).fail(function (error) {
    console.error(error.stack || error);
    process.exit(1);
}).done(function () {
    process.exit();
});

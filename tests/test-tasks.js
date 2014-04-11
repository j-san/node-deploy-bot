
var bot = require('../lib'),
    Shell = require('../lib/shell'),
    Q = require('q'),
    sinon = require('sinon'),
    should = require('should');

var done = 0;
var test1 = sinon.spy();
var test2 = sinon.spy();
var testDelayed = sinon.spy(function testDelayed (shell) {
    return Q.delay(200);
});

bot.registerTask('test-1', test1);
bot.registerTask('test-2', test2);
bot.registerTask('test-delayed', testDelayed);


var shell = new Shell();
shell.connect('vagrant').then(function () {
    return shell.run('test-1');
}).then(function () {
    return shell.run('test-delayed');
}).then(function () {
    return shell.run('test-1');
}).then(function () {
    test1.callCount.should.equal(2);
    testDelayed.callCount.should.equal(1);
    done++;
}).then(function () {
    return [
        shell.run('test-1').then(function () {
            test1.callCount.should.equal(3);
            done++;
        }),
        shell.run('test-delayed').then(function () {
            testDelayed.callCount.should.equal(2);
            done++;
        }),
        shell.run('test-2').then(function () {
            test2.callCount.should.equal(1);
            done++;
        })
    ];
}).all().then(function () {
    return shell.run('test-1', 'test-2');
}).then(function () {
    test1.callCount.should.equal(4);
    test2.callCount.should.equal(2);
    done++;
}).finally(function () {
    shell.disconnect();
}).fail(function (error) {
    console.error(error.stack || error);
    process.exit(1);
}).done(function () {
    done.should.equal(5);
    process.exit();
});

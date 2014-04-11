
Deploy Bot
==========

A simple api for an **agent less** DevOps infrastructure provisionning bot.

Why Node.js ?
-------------

1- **Node.js likes I/O** !! provisionning is all about input and ouput.

2- Lets handle multiple long processes and concurencial access easily.

3- promisses and events are perfect for dependencies and notifications


Command line API
----------------

### Configure servers hosts

./deploy-bot.json or /etc/deploy-bot.json
```json
{
    "host": {
        "host": "host.lan",
        "username": "user",
        "privateKey": "/home/user/.ssh/id_rsa"
    }
}
```

then run tasks:

```bash
deploy-bot -r uptime host
```


Programatic API
---------------

### Connect

```javascript
Shell = require('deploy-bot/shell');

var shell = new Shell();

shell.connect('host', function (shell) {
    console.log(shell.banner);
    shell.disconnect();
    process.exit();
});
```

### Install

```javascript
shell.connect('host', function () {
    return [
        shell.install('yum', ['nodejs', 'mongodb']),
        shell.install('gem', 'foreman')
    ]
}).all().done(function () {
    shell.disconnect();
    process.exit();
});
```


### Configure

```javascript
shell.connect('host', function () {

    return [
        shell.install('yum', 'mongodb'),
        shell.user({ // not yet implemented
            name: 'appuser',
            home: '/var/lib/app',
            group: 'users'
        }),
        shell.file('/etc/logrotate.d/mongodb', {
            template: 'mongodb/logrotate'
        }),
        shell.file('/etc/mongod.conf', {
            template: 'mongodb/conf'
        })
    ];
}).all().then(function () {
    shell.disconnect();
    process.exit();
});
```

### Script

```javascript
var bot = require('deploy-bot');

bot.registerTask('mytask', function (shell) {
    // do stuff here
});

shell.connect('host', function () {
    return shell.run('mytask'); // execute task
});
```

or

```sh
deploy-bot -r mytask host
```

Roadmap
-------

- Testable
- Migrable, profile version
- Profiles: aptitude, pacman
- simple cmd interface
- simple web gui
- Hubot adapter
- host "state" object attribute in host config
- host "base" attribute for merge target host "state" in host config



Examples
--------

```javascript
Shell = require('deploy-bot/shell');

var cwd = '/home/user/myproject';

var shell = new Shell();
shell.connect('host', function () {
    return [
        shell.exec('mkdir -p ' + cwd + '/var/log/'),
        shell.exec('git clone git@github.com:you/myproject ' + cwd)
    ]
}).all().then(function () {
    return shell.exec('make install', cwd);
}).then(function () {
    return shell.exec(cwd + 'myproject/bin/run');

}).finally(function () {
    shell.disconnect();
}).fail(function (error) {
    console.error(error.stack || error);
    process.exit(1);
}).done(function () {
    process.exit();
});
```

```javascript
shell.connect('host', function (shell) {
    return shell.install('nginx', 'postgres');
}).then(function () {
    return [
        shell.file.envFile('/home/user/env', {
            DB_HOST: 'localhost',
            DB_USER: 'user',
            EVIRONMENENT: 'staging'
        }),
        shell.file.addline('/home/user/.bashrc', 'source ~/env'),
        shell.file.upstart('/etc/init/myproject.conf', {
            script: '/bin/myproject run',
        })
    ];
}).all().then(function () {
    exec('initctl start myproject');
}).finally(function () {
    shell.disconnect();
}).fail(function (error) {
    console.error(error.stack || error);
}).done(function () {
    process.exit();
});
```

```javascript
bot.reguisterTask('mongo-server-install', function(shell) {
    return Q.all([
        shell.install('yum', ['mongo', 'mongo-server']),
        shell.file.templateFile('/etc/mongod.conf')
    ]).then(function () {
        return shell.sudo('mongod -f /etc/mongod.conf');
    })
});

bot.reguisterTask('mongo-server-restart', function(shell) {
    /* ... */
});
```


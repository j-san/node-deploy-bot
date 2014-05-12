
Deploy Bot
==========

[![NPM](http://img.shields.io/npm/v/deploy-bot.svg)](https://www.npmjs.org/package/deploy-bot)

A simple tool for an **agent less** continuous deployment bot.

    This project is under conception, if you would like to see it alive, **star it**.


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
});
```

### Install

```javascript
bot.registerTask('node-mondodb', function (shell) {

    return Q([
        shell.install('yum', ['nodejs', 'mongodb']),
        shell.install('gem', 'foreman')
    ]).all();
});
```


### Configure

```javascript
bot.registerTask('conf', function (shell) {

    return Q([
        shell.install('yum', 'mongodb').then(function () {
            return shell.run('rm -rf /tmp/*');
        }),
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
    ]).all();
});
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



[Examples](examples)
--------------------

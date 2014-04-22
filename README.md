
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
}).all().done(function () {
    shell.disconnect();
});
```

### Script

```javascript
var bot = require('deploy-bot');

bot.registerTask('mytask', function (shell) {
    return shell.run('othertask'); // execute task
});

bot.registerTask('othertask', function (shell) {
    // do stuff here
});
```

then

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



[Examples](examples)
--------------------

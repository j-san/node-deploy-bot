
Deploy Bot
==========

A simple api for an **agent less** DevOps infrastructure provisionning tool.

Why Node.js ?
-------------

1- **Node.js likes I/O** !! provisionning is all about input and ouput.

2- Lets handle multiple long processes and concurencial access easily.

3- promisses and events are perfect for dependencies and notifications


```javascript
deploy = require('deploy');
Q = require('q');

var host = {
    host: 'localhost',
    port: 2222,
    username: 'vagrant',
    privateKey: privateKey
};
var cwd = '/home/user/myproject';

deploy.connect(host, function (shell) {
    return Q.all([
        shell.exec('mkdir -p ' + cwd + '/var/log/'),
        shell.exec('git clone git@github.com:you/myproject ' + cwd)
    ]).then(function () {
        return shell.exec('make install', cwd);
    }).then(function () {
        return shell.exec(cwd + 'myproject/bin/run');

    }).fail(function (error) {
        console.error(error.stack || error);
    }).then(function () {
        shell.disconnect();
        process.exit();
    });
});
```


```javascript
deploy.connect(host, function (shell) {
    shell.profile('yum', function () {
        return Q.all([
            yum.install('nginx', 'postgres'),
            file.envVars('/home/user/env', {
                DB_HOST: 'localhost',
                DB_USER: 'user',
                EVIRONMENENT: 'staging'
            }),
            file.addline('/home/user/.bashrc', 'source ~/env'),
            file.upstart('/etc/init/myproject.conf', {
                script: '/bin/myproject run',
            })
        ]).then(function () {
                exec('initctl start myproject');
        });

    }).fail(function (error) {
        console.error(error.stack || error);
    }).then(function () {
        shell.disconnect();
        process.exit();
    });
});
```

```javascript
deploy.reguisteProfile('mongo-server', function(shell, callback) {
    return shell.profile('yum', 'filesystem', function (yum, fs) {
        Q.all([
            yum.install('mongo', 'mongo-server'),
            fs.templateFile('/etc/mongod.conf')
        ]).then(function () {
            return shell.profile('sudo', function (yum, fs) {
                return sudo.exec('mongod -f /etc/mongod.conf');
            }).done(function () {
                callback({
                    restart: function() {/* ... */}
                });
            });
        });
    });
});
```


API
---


Roadmap
-------

- apt, pacman profiles
- load multiple profile
- config backend -> json or mongodb ?
- testable
- profile migration
- simple cmd interface
- simple web gui


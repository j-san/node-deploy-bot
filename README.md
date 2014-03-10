
Deploy Bot
==========

A simple api for an **agent less** DevOps infrastructure provisionning bot.

Why Node.js ?
-------------

1- **Node.js likes I/O** !! provisionning is all about input and ouput.

2- Lets handle multiple long processes and concurencial access easily.

3- promisses and events are perfect for dependencies and notifications


API
---

### Connect

```javascript
deploy = require('deploy');

var host = {
    host: 'localhost',
    port: 2222,
    username: 'vagrant',
    privateKey: process.env.HOME + '/.vagrant.d/insecure_private_key'
};

deploy.connect(host, function (shell) {
    console.log(shell.banner);
    shell.disconnect();
    process.exit();
});
```

### Install

```javascript
deploy.connect(host, function (shell) {

    shell.profile('yum').then(function (yum) {

        return yum.install('nodejs');

    }).then(function () {
        shell.disconnect();
        process.exit();
    });
});
```


### Configure

```javascript
deploy.connect(host, function (shell) {

    shell.profile('filesystem', 'sudo').then(function (fs, sudo) {
        return [
            sudo.user({
                name: 'appuser',
                home: '/var/lib/app',
                group: 'users'
            }),
            fs.file('/etc/logrotate.d/mongodb', {
                template: 'mongodb/logrotate'
            }),
            fs.file('/etc/mongod.conf', {
                template: 'mongodb/conf'
            })
        ];
    }).then(function () {
        shell.disconnect();
        process.exit();
    });
});
```
### Script

```javascript
deploy.registerTask('mytask', function (shell) {
    // do stuff here
    // return an object
    return {
        foo: function () {},
        bar: function () {}
    }
});

deploy.connect(host, function (shell) {
    shell.do('mytask'); // execute stuff
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


Examples
--------

```javascript
deploy = require('deploy');
Q = require('q');

var cwd = '/home/user/myproject';

deploy.connect(host, function (shell) {
    return Q.all([
        shell.exec('mkdir -p ' + cwd + '/var/log/'),
        shell.exec('git clone git@github.com:you/myproject ' + cwd)
    ]).then(function () {
        return shell.exec('make install', cwd);
    }).then(function () {
        return shell.exec(cwd + 'myproject/bin/run');
    }).finally(function () {
        shell.disconnect();
    });
}).fail(function (error) {
    console.error(error.stack || error);
}).done(function () {
    process.exit();
});
```

```javascript
deploy.connect(host, function (shell) {
    shell.profile('yum', function () {
        return [
            yum.install('nginx', 'postgres'),
            file.envFile('/home/user/env', {
                DB_HOST: 'localhost',
                DB_USER: 'user',
                EVIRONMENENT: 'staging'
            }),
            file.addline('/home/user/.bashrc', 'source ~/env'),
            file.upstart('/etc/init/myproject.conf', {
                script: '/bin/myproject run',
            })
        ];
    }).then(function () {
        exec('initctl start myproject');
    }).finally(function () {
        shell.disconnect();
    });
}).fail(function (error) {
    console.error(error.stack || error);
}).done(function () {
    process.exit();
});
```

```javascript
deploy.reguisteProfile('mongo-server', function(shell) {
    return shell.profile('yum', 'filesystem', function (yum, fs) {
        Q.all([
            yum.install('mongo', 'mongo-server'),
            fs.templateFile('/etc/mongod.conf')
        ]).then(function () {
            return shell.profile('sudo', function (yum, fs) {
                return sudo.exec('mongod -f /etc/mongod.conf');
            }).then(function () {
                return {
                    restart: function() {/* ... */}
                };
            });
        });
    });
});
```


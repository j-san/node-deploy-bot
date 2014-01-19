
Node Deploy Bot
===============

A simple api for an **agent less** DevOps infrastructure provisionning tool.

Why Node.js ?
-------------

1- **Node.js likes I/O** !! provisionning is all about input and ouput.

2- Lets handle multiple long processes and concurencial access easily.

3- promisses and events are perfect for dependencies and notifications


```javascript
deploy = require('deploy');
q = require('q');

cwd = '/home/user/myproject';

deploy.connect({
    host: 'localhost',
    port: 2222,
    username: 'vagrant',
    privateKey: privateKey
}).then(function (shell) {
    q.all([
        shell.exec('mkdir -p ' + cwd + '/var/log/'),
        shell.exec('git clone git@github.com:you/myproject ' + cwd)
    ]).then(function () {
        return shell.exec('make install', cwd);
    }).then(function () {
        return shell.exec(cwd + 'myproject/bin/run');
    });
}).fail(function (error) {
    console.error('sometgins went wrong...');
    console.error(error.stack || error);
}).then(function () {
    deploy.disconnect();
    process.exit();
});
```


```javascript
yum = require('deploy').yum;
file = require('deploy').file;

q.all([
    yum.repo(''),
    yum.install('nginx', 'postgres'),

    file.env('/home/user/env', {
        DB_HOST: 'localhost',
        DB_USER: 'user',
        EVIRONMENENT: 'staging'
    }),

    file.addline('/home/user/.profilerc', 'source ~/env'),

    file.upstart('/etc/init/myproject.conf', {
        script: '/bin/myproject run',
    })
]).then(function () {
    exec('initctl start myproject');
});
```

```javascript
reguisteTask('restart-pg', function() {
    pg = require('deploy-pg');
    pg.install().then(function () {
        pg.restart();
    });
});
```


API
---


Roadmap
-------

- apt, pacman profiles
- config backend -> json or db ?
- simple cmd interface
- simple web gui


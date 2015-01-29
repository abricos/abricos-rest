'use strict';

var treeConfig = require('tree-config');

treeConfig.configure({
    OVERRIDE_CONFIG_FILE: 'myabricos.json',

    IMPORTS: [{
        key: 'package',
        file: 'package.json'
    }, {
        key: 'smtpeshka',
        file: 'smtpeshka.json'
    }],

    ROOT_OPTIONS: {
        directory: process.cwd(),
        log: {
            console: {
                level: 'info',
                colorize: 'true',
                timestamp: 'HH:MM:ss',
                label: 'api'
            }
        },
        api: {
            module: {
                pathTemplate: '<%= directory %>/lib/{v#module}'
            }
        },
        smtpeshka: {
            web: {
                port: 2580
            }
        }
    }
});

module.exports = treeConfig;

'use strict';

var config = require('tree-config');
var configLogger = require('tree-config-logger');

config.PluginManager.register('logger', configLogger);

config.setDefaults({
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
});

config.configure({
    sources: [
        {
            type: 'json',
            key: 'package',
            src: 'package.json'
        }, {
            type: 'json',
            key: 'smtpeshka',
            src: 'smtpeshka.json'
        }
    ]
});

module.exports = config;

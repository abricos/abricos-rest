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
        uri: "http://localhost",
        module: {
            pathTemplate: "<%= directory %>/abricos.src/modules/{v#module}/lib/api/"
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
            src: 'abricos.json'
        }, {
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

config.children.create('module');

module.exports = config;
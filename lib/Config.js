/*
 * Copyright (c) 2014 Alexander Kuzmin <roosit@abricos.org>
 * Licensed under the MIT license.
 * https://github.com/abricos/abricos-rest/blob/master/LICENSE
 */

'use strict';

var treeConfig = require('tree-config'),
    Config = treeConfig.Config;

module.exports = treeConfig;
Config.MY_CONFIG_FILE = "apiconfig.json";
Config.ROOT_DEFAULT_OPTIONS = {
    directory: process.cwd(),
    log: {
        console: {
            level: 'info',
            colorize: 'true',
            timestamp: 'HH:MM:ss'
        }
    },
    api: {
        uri: ''
    }
};
Config.IMPORTS = [{
    key: 'package',
    file: 'package.json'
}];

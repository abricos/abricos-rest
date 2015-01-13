/*
 * Copyright (c) 2014 Alexander Kuzmin <roosit@abricos.org>
 * Licensed under the MIT license.
 * https://github.com/abricos/abricos-rest/blob/master/LICENSE
 */

'use strict';

var User = require('./User');

var Config = require('./Config'),
    logHelper = Config.logHelper;

function API(){
    this.config = Config.instance('api');
    this.modules = {};

    this.registerModule(User);
};
API.prototype.registerModule = function(moduleClass){
    var config = this.config;
    var module = new moduleClass(this, {
        parentId: config.id
    });
    this.modules[module.name] = module;
    return module;
};

API.prototype.getModule = function(moduleName){
    return this.modules[moduleName];
};

API.prototype.get = function(url, params, callback){
    var request = require('request');

    var uri = config.get('api.uri');
    url = uri + url;

    request({
        method: 'GET',
        uri: url,
        // oauth: self.opts,
        json: true
    }, function(err, response, body){
        return callback(err, body);
    });
};

API.prototype.post = function(modName, data, callback){
    var request = require('request'),
        config = this.config,
        logger = config.logger();

    var uri = config.get('api.uri'),
        url = uri + '/tajax/' + modName + '/' + (new Date()).getTime();

    logger.debug('module %s, host %s, send %s', logHelper.string(modName), logHelper.string(uri), logHelper.string(JSON.stringify(data)));

    request({
        method: 'POST',
        headers: {'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'},
        uri: url,
        form: 'data=' + JSON.stringify(data)
    }, function(err, response, body){
        if (err){
            return callback(err, body);
        }

        var json;
        try {
            json = JSON.parse(body);
        } catch (jsonError) {
        }

        var result;
        if (typeof json === 'undefined' || !json.data){
            err = new Error('Poor response: ' + body);
        } else {
            result = json.data;
            logger.debug('module %s, host %s, response %s',
                logHelper.string(modName),
                logHelper.string(uri),
                logHelper.string(JSON.stringify(result))
            );
        }
        return callback(err, result);
    });
};

module.exports = API;
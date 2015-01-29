'use strict';

var fs = require('fs');
var SMTPeshka = require('./SMTPeshka');
var JSDOM = require('./JSDOM');

var treeConfig = require('./treeConfig'),
    logHelper = treeConfig.utils.helper;

function API(){
    this.config = treeConfig.instance();
    this.modules = {};

    this.smtpeshka = new SMTPeshka(this.config);
    this.jsDOM = new JSDOM(this.config);
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
    if (!this.modules[moduleName]){
        var moduleClass = this._loadModule(moduleName);
        this.registerModule(moduleClass);
    }

    return this.modules[moduleName];
};

API.prototype._loadModule = function(moduleName){
    var config = this.config,
        pathTemplate = config.get('api.module.pathTemplate');
    var dir = pathTemplate.replace(/\{v\#module\}/g, moduleName);

    if (!fs.existsSync(dir)){
        throw new Error('Module `' + moduleName + '` not found in dir `' + dir + '`');
    }

    var moduleClass = require(dir);
    return moduleClass;
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
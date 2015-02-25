'use strict';

var fs = require('fs');
var SMTPeshka = require('./SMTPeshka');
var JSDOM = require('./JSDOM');

var config = require('./config'),
    logHelper = config.logger().helper;

function API(){
    this.config = config;
    this.modules = {};

    this.smtpeshka = new SMTPeshka(this.config);
    this.jsDOM = new JSDOM(this.config);

    this.userSessionKey = '';
};

API.prototype.registerModule = function(moduleClass){
    var config = this.config;
    var module = new moduleClass(this, {
        parentId: config.id,
        apiVersion: '1'
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

API.prototype.url = function(modName){
    var module = this.getModule(modName),
        apiVersion = module.config.get('apiVersion'),
        config = this.config,
        uri = config.get('api.uri'),
        url = uri + '/api/' + modName + '/v' + apiVersion + '/';

    return url;
};

API.prototype.get = function(modName, method, data, callback){
    var request = require('request'),
        config = this.config,
        logger = config.logger();

    var url = this.url(modName) + method;

    logger.debug('GET: module %s, url %s, request %s',
        logHelper.string(modName),
        logHelper.string(url),
        logHelper.string(JSON.stringify(data))
    );

    var headers = {};

    if (this.userSessionKey){
        headers['Authorization'] = 'Session ' + this.userSessionKey;
    }

    request({
        method: 'GET',
        headers: headers,
        uri: url
    }, function(err, response, body){
        if (err){
            return callback(err, body);
        }
        var hAuth = response.headers['authorization'];
        if (hAuth){
            var aParams = hAuth.split(' ');
            if (aParams.length === 2 && aParams[0] === 'Session'){
                this.userSessionKey = aParams[1];
            }
        }

        var json;
        try {
            json = JSON.parse(body);
        } catch (jsonError) {
        }

        if (typeof json === 'undefined' || !json){
            err = new Error('Poor response: ' + body);
            return callback(err, null);
        }

        logger.debug('module %s, host %s, response %s',
            logHelper.string(modName),
            logHelper.string(url),
            logHelper.string(JSON.stringify(json))
        );

        if (json.err){
            var err = new Error(json.msg);
            err.code = json.err;
            err.statusCode = response.statusCode;
            return callback(err, null);
        }

        return callback(err, json);
    });
};


API.prototype.post = function(modName, method, data, callback){
    var request = require('request'),
        config = this.config,
        logger = config.logger();

    var url = this.url(modName) + method;

    logger.debug('POST: module %s, url %s, request %s',
        logHelper.string(modName),
        logHelper.string(url),
        logHelper.string(JSON.stringify(data))
    );

    var headers = {};

    if (this.userSessionKey){
        headers['Authorization'] = 'Session ' + this.userSessionKey;
    }
    request({
            method: 'POST',
            headers: headers,
            uri: url,
            form: data
        }, function(err, response, body){
            if (err){
                return callback(err, body);
            }
            var hAuth = response.headers['authorization'];
            if (hAuth){
                var aParams = hAuth.split(' ');
                if (aParams.length === 2 && aParams[0] === 'Session'){
                    this.userSessionKey = aParams[1];
                }
            }

            var json;
            try {
                json = JSON.parse(body);
            } catch (jsonError) {
            }

            if (typeof json === 'undefined' || !json){
                err = new Error('Poor response: ' + body);
                return callback(err, null);
            }

            logger.debug('module %s, host %s, response %s',
                logHelper.string(modName),
                logHelper.string(url),
                logHelper.string(JSON.stringify(json))
            );

            if (json.err){
                var err = new Error(json.msg);
                err.code = json.err;
                err.statusCode = response.statusCode;
                return callback(err, null);
            }

            return callback(err, json);
        }
    );
};

module.exports = API;
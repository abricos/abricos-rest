'use strict';

var fs = require('fs');
var util = require('util');

function API(auth){
    this._modules = {};
    this.config = require('./config');

    this._auth = auth || {};

    this.sessionId = null;
    this.sessionName = 'PHPSESSID';
}

API.prototype._getModule = function(name){
    return this._modules[name] ? this._modules[name] : null;
};

API.prototype._requireModule = function(name){
    var module = this._getModule(name);
    if (module){
        return module;
    }

    var config = this.config;
    var pathTemplate = config.get('api.module.pathTemplate');
    var dir = pathTemplate.replace(/\{v\#module\}/g, name);

    if (!fs.existsSync(dir)){
        throw new Error('Module `' + name + '` not found in dir `' + dir + '`');
    }

    var Module = require(dir);
    return this._modules[name] = new Module(this, name);
};

API.prototype._initUserModule = function(callback, context){
    var userModule = this._getModule('user');

    if (userModule){
        return callback.call(context, null, userModule);
    }

    userModule = this._requireModule('user');

    var userModuleInit = function(){
        userModule._init(function(err){
            if (err){
                throw new Error('User Module is not initialize');
            }
            return callback.call(context, null, userModule);
        }, this);
    };

    var auth = this._auth;

    if (auth.login && auth.password){
        userModule.signIn(auth, function(err, session){
            if (err){
                return callback.call(context, null, userModule);
            }
            return userModuleInit.call(this);
        }, this);
    } else {
        userModuleInit.call(this);
    }
};
API.prototype._setSession = function(session){
    this.sessionId = session.sessionId;
    this.sessionName = session.sessionName;
};

API.prototype.module = function(name, callback, context){
    context = context || this;

    if (name === 'user'){
        return this._initUserModule(callback, context);
    }

    throw new Error('TODO release!');
};

API.prototype.getURI = function(module, method, args){
    var uri = this.config.get('api.uri');
    var url = uri + '/api/' + module.name + '/';

    if (!method){
        return url;
    }

    var version = module.config.get('api.version');
    url += 'v' + version + '/' + method + '/';

    if (!args || args.length === 0){
        return url;
    }

    url += args.join('/') + '/';

    return url;
};

API.prototype.get = function(uri, callback, context){
    context = context || this;

    var request = require('request');
    var headers = {};

    if (this.sessionId){
        headers[this.sessionName] = this.sessionId;
    }

    request({
        method: 'GET',
        headers: headers,
        uri: uri
    }, function(err, response, body){
        if (err){
            return callback.call(context, err, null);
        }

        var json = body;
        try {
            json = JSON.parse(body);
        } catch (err) {
        }

        if (typeof json === 'undefined' || !json){
            err = new Error('Poor response: ' + body);
            return callback.call(context, err, null);
        }

        return callback.call(context, null, json);
    });
};

API.prototype.post = function(uri, data, callback, context){
    context = context || this;

    var request = require('request');
    var headers = {
        'Content-Type': 'application/json'
    };

    if (this.sessionId){
        headers[this.sessionName] = this.sessionId;
    }

    request({
        method: 'POST',
        json: true,
        headers: headers,
        uri: uri,
        body: data
    }, function(err, response, body){

        if (err){
            return callback(err, body);
        }

        var json = body;
        /*
         try {
         json = JSON.parse(body);
         } catch (err) {
         }
         /**/
        if (typeof json === 'undefined' || !json){
            err = new Error('Poor response: ' + body);
            return callback.call(context, err, null);
        }

        return callback.call(context, null, json);
    });
};

module.exports = API;
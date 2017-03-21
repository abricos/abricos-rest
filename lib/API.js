'use strict';

var fs = require('fs');
var util = require('util');
var request = require('request');
var Response = require('./Response');

function API(auth){
    this.modules = {};
    this.config = require('./config');

    this._auth = auth || {};

    this.sessionId = null;
    this.sessionName = 'PHPSESSID';
}

API.prototype._getModule = function(name){
    return this.modules[name] ? this.modules[name] : null;
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
    return this.modules[name] = new Module(this, name);
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

    var module = this._getModule(name);
    if (module){
        return callback.call(context, null, module);
    }

    this._initUserModule(function(){
        module = this._requireModule(name);
        module._init(function(err){
            if (err){
                throw new Error('`' + name + '` Module is not initialize');
            }
            return callback.call(context, null, module);
        }, this);
    }, this);
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

API.prototype._request = function(options){
    var callback = options.callback;
    var context = options.context || this;

    var rConfig = {
        method: options.method,
        headers: {
            'Content-Type': 'application/json'
        },
        json: true,
        uri: options.uri
    };

    if (this.sessionId){
        rConfig.headers[this.sessionName] = this.sessionId;
    }

    if (options.method === 'POST'){
        rConfig.body = options.data;
    }

    var ext = options.ext;
    var module = null;
    var structure = null;
    if (ext && ext.module && ext.structure){

        module = this.modules[ext.module];
        if (!module){
            throw {msg: 'Module `' + ext.module + '` not found in API'};
        }

        structure = module.structures && module.structures[ext.structure]
            ? module.structures[ext.structure]
            : null;

        if (!structure){
            throw {msg: 'Structure `' + ext.structure + '` not found in API Module `' + ext.module + '`'};
        }
    }

    request(rConfig, function(err, response){
        var abResponse = new Response(rConfig, err, response, module, structure);
        var abErr = abResponse.getError();
        callback.call(context, abErr, abResponse);
    });
};

API.prototype.get = function(uri, callback, context, ext){
    this._request({
        method: 'GET',
        uri: uri,
        callback: callback,
        context: context,
        ext: ext
    });
};

API.prototype.post = function(uri, data, callback, context, ext){
    this._request({
        method: 'POST',
        uri: uri,
        data: data,
        callback: callback,
        context: context,
        ext: ext
    });
};

module.exports = API;
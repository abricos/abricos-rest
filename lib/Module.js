'use strict';

var util = require('util');

function Module(api, name){
    this.api = api;
    this.name = name;

    var configModule = api.config.children.get('module');
    this.config = configModule.children.get(name);
    if (!this.config){
        this.config = configModule.children.create(name);
    }

    this.config.setDefaults({
        name: name,
        api: {
            version: 1
        },
        log: {
            console: {
                label: '<%= ^.log.console.label %>.<%= name %>'
            }
        }
    });
};

Module.prototype.onInit = function(result){
};

Module.prototype._onInit = function(result){
    this.version = result.version;
    this.structures = result.structures;
    this.methods = result.methods;

    this.onInit(result);
};

Module.prototype._init = function(callback, context){
    context = context || this;
    if (this._isInit){
        return callback.call(context, null, this);
    }
    this._isInit = true;

    var api = this.api;
    var uri = api.getURI(this);

    api.get(uri, function(err, result){
        if (err){
            return callback.call(context, err, this);
        }

        this._onInit(result);

        return callback.call(context, null, this);
    }, this);
};

module.exports = Module;
/*
 * Copyright (c) 2014 Alexander Kuzmin <roosit@abricos.org>
 * Licensed under the MIT license.
 * https://github.com/abricos/abricos-rest/blob/master/LICENSE
 */

'use strict';

var Config = require('./Config');

function API(){
    this.config = Config.instance('api');
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
        config = this.config;

    var uri = config.get('api.uri'),
        url = uri + '/tajax/' + modName + '/';

    request({
        method: 'POST',
        uri: url,
        form: {
            data: data
        }
    }, function(err, response, body){
        if (err){
            return callback(err, body);
        }

        var json;
        try {
            json = JSON.parse(body);
        } catch (err1) {
        }
        if (typeof json === 'undefined'){
            err = new Error('Poor response: ' + body);
        }

        return callback(err, json);
    });
};

module.exports = API;
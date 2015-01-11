/*
 * Copyright (c) 2014 Alexander Kuzmin <roosit@abricos.org>
 * Licensed under the MIT license.
 * https://github.com/abricos/abricos-rest/blob/master/LICENSE
 */

'use strict';

var merge = require('merge');

var Config = require('./Config');
var logHelper = Config.logHelper;

var DEFAULT_OPTIONS = {
    id: 'user',
    log: {
        console: {
            label: '<%= ^.log.console.label %>.user'
        }
    }
};

function User(api, options){
    options = merge.recursive(true, DEFAULT_OPTIONS, options || {});

    this.config = Config.instance(options);

    this.api = api;
    this._cacheUserCurrent = null;

    this.name = 'user';
};
User.prototype = {
    logger: function(){
        return this.config.logger();
    },
    cacheClear: function(){
        this.current = null;
    },
    userCurrent: function(callback){
        var logger = this.logger();

        if (this._cacheUserCurrent){
            logger.debug('User current is taken from the cache');
            return callback(null, this.current);
        }
        var instance = this;
        var data = {
            do: 'userCurrent'
        };
        logger.debug('Get current user');
        this.api.post('user', data, function(err, result){
            if (err){
                return callback(err, null);
            }

            if (!result.userCurrent){
                err = new Error('Server error: did not return a userCurrent');
                return callback(err, null);
            }

            instance._cacheUserCurrent = result.userCurrent;
            return callback(null, result.userCurrent);
        });
    }

};

module.exports = User;
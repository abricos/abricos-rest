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
    },
    auth: function(authData, callback){
        this.cacheClear();

        var logger = this.logger();

        var instance = this;
        var data = {
            do: 'auth',
            authData: authData
        };
        logger.debug('Authorization');
        this.api.post('user', data, function(err, result){
            if (err){
                return callback(err, null);
            }

            if (result.err && result.err > 0){
                var message = 'Unknown authorization error';
                switch (result.err) {
                    case 1:
                        message = 'Error in the username';
                        break;
                    case 2:
                        message = 'Invalid user name or password';
                        break;
                    case 3:
                        message = 'Do not fill in the required fields';
                        break;
                    case 4:
                        message = 'User is blocked';
                        break;
                    case 5:
                        message = 'It is necessary to pass the activation of the user (confirmation email)';
                        break;
                }

                err = new Error(message);
                err.code = result.err;
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
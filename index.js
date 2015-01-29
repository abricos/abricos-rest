/*
 * Copyright (c) 2014 Alexander Kuzmin <roosit@abricos.org>
 * Licensed under the MIT license.
 * https://github.com/abricos/abricos-rest/blob/master/LICENSE
 */

'use strict';

var API = require('./lib/api');
var helper = require('./lib/helper');

module.exports.API = function(){
    return new API();
};

module.exports.helper = helper;
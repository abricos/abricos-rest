'use strict';

var async = require('async');

var distinct = {};

var randomInt = function(min, max){
    min = min || 0;
    max = max || 100000;

    var value = Math.floor(Math.random() * (max - min) + min);

    if (distinct[value]){
        return randomInt(min, max);
    }

    distinct[value] = true;

    return value;
};

module.exports.randomInt = randomInt;
module.exports.async = async;
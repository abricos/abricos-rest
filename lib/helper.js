'use strict';

module.exports.randomInt = function(min, max) {
    min = min || 0;
    max = max || 100000;
    
    return Math.floor(Math.random() * (max - min) + min);
}
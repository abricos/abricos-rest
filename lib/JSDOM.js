'use strict';

var cheerio = require('cheerio');

function JSDOM(config){
    this.config = config;
};

JSDOM.prototype.load = function(htmlText){
    return cheerio.load(htmlText);
};

module.exports = JSDOM;
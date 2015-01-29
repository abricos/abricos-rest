'use strict';

var request = require('request');

function SMTPeshka(config){
    this.config = config;
};

SMTPeshka.prototype.get = function(url, callback){
    var config = this.config;
    var host = 'http://localhost:' + config.get('smtpeshka.web.port');
    var uri = host + url;

    request({
        method: 'GET',
        uri: uri,
        json: true
    }, function(err, response, body){
        return callback(err, body);
    });

};

SMTPeshka.prototype.status = function(callback){
    this.get('/api/status', function(err, json){
        return callback ? callback(err, json) : null;
    });
};

SMTPeshka.prototype.emailList = function(callback){
    var uri = '/api/';
    this.get(uri, function(err, json){
        return callback ? callback(err, json) : null;
    });
};

SMTPeshka.prototype.email = function(messageId, callback){
    var uri = '/api/email/' + messageId;
    this.get(uri, function(err, json){
        return callback ? callback(err, json) : null;
    });
};

module.exports = SMTPeshka;
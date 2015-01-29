'use strict';

var should = require('should');
var Abricos = require('../index');

describe('Abricos API Functions', function(){

    var api;

    it('should be instance', function(done){

        api = new Abricos.API();
        should.exist(api);
        should.exist(api.smtpeshka);

        done();
    });

});

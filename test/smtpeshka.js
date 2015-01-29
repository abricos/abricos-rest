'use strict';

var should = require('should');
var Abricos = require('../index');

describe('Abricos API Functions', function(){

    var smtpeshka;

    before(function(done){
        var api = new Abricos.API();
        smtpeshka = api.smtpeshka;
        done();
    });

    it('should be status', function(done){
        smtpeshka.status(function(err, status){
            should.not.exist(err);
            should.exist(status);
            done();
        });
    });

    it('should be email list', function(done){
        smtpeshka.emailList(function(err, status){
            done();
        });
    });
});

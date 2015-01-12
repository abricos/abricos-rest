'use strict';

var Abricos = require('../index');
var should = require('should');

describe('Abricos.API', function(){

    var userModule;

    beforeEach(function(done){
        var api = new Abricos.API();
        userModule = api.getModule('user');

        done();
    });

    describe('User Module', function(){

        it('Guest user info', function(done){
            userModule.userCurrent(function(err, userCurrnet){
                should.not.exist(err);
                should.exist(userCurrnet);

                userCurrnet.should.have.property('id', 0);
                userCurrnet.should.have.property('username', 'Guest');
                userCurrnet.should.have.property('session');
                userCurrnet.should.have.property('permission');

                done();
            });
        });

        describe('Authorization', function(){

            describe('Authorization errors', function(){

                it('Bad user name, error code 1', function(done){
                    var authData = {
                        username: '#)GD*@)a;sdfj asdf;j',
                        password: 'asdf'
                    };
                    userModule.auth(authData, function(err, result){
                        should.exist(err);
                        err.should.have.property('code', 1);
                        should.not.exist(result);
                        done();
                    });
                });

                it('Invalid user name or password, error code 2', function(done){
                    var authData = {
                        username: 'user',
                        password: 'mypassword'
                    };
                    userModule.auth(authData, function(err, result){
                        should.exist(err);
                        err.should.have.property('code', 2);
                        should.not.exist(result);
                        done();
                    });
                });

            });

            it('Admin user authorization', function(done){

                var authData = {
                    username: 'admin',
                    password: 'admin',
                    autologin: true
                };

                userModule.auth(authData, function(err, result){
                    should.not.exist(err);

                    should.exist(result);

                    done();
                });
            });
        });
    });
});

'use strict';

var Abricos = require('../index');
var should = require('should');

describe('Abricos.API Module Network Functions:', function () {

  describe('User API', function () {
    it('should send a current user info', function (done) {
      this.timeout(40000);

      var api = new Abricos.API();
      var userModule = api.getModule('user');

      userModule.userCurrent(function (err, userCurrnet) {
        should.not.exist(err);

        userCurrnet.should.have.property('id');
        userCurrnet.should.have.property('username');
        userCurrnet.should.have.property('permission');

        should.exist(userCurrnet);

        done();
      });
    });
  });

  describe('User API', function () {
    it('should admin user authorization', function (done) {
      this.timeout(40000);

      var api = new Abricos.API();
      var userModule = api.getModule('user');

      userModule.auth(function (err, userCurrnet) {
        should.not.exist(err);

        userCurrnet.should.have.property('id');
        userCurrnet.should.have.property('username');
        userCurrnet.should.have.property('permission');

        should.exist(userCurrnet);

        done();
      });
    });
  });
});

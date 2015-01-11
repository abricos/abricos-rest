'use strict';

var Abricos = require('../index');
var should = require('should');

describe('Abricos.API Module Network Functions:', function () {
  describe('API.post()', function () {
    it('should send a current user info', function (done) {
      this.timeout(40000);

      var api = new Abricos.API();

      api.should.be.an.instanceOf(Object);

      var userModule = api.getModule('user');

      userModule.userCurrent(function (err, userCurrnet) {
        should.not.exist(err);

        should.exist(userCurrnet);

        done();
      });

    });
  });

});

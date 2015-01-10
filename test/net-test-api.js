'use strict';

var Abricos = require('../index');
var should = require('should');

describe('Abricos.API Module Network Functions:', function () {
  describe('API.post()', function () {
    it('should send a current user info', function (done) {
      this.timeout(40000);

      var api = new Abricos.API();
      var data = {
        do: 'userCurrent'
      };

      api.post('user', data, function (err, response) {
        should.not.exist(err);

        should.exist(response);

        // response.should.be.an.instanceOf(Object);

        done();
      });
    });
  });

});

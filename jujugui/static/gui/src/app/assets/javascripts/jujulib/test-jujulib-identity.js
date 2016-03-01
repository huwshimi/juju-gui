/* Copyright (C) 2015 Canonical Ltd. */

'use strict';

describe('jujulib identity', function() {
  var identity;

  beforeEach(function() {
    var bakery = {
      sendGetRequest: sinon.stub()
    };
    identity = new window.jujulib.identity('local/', 'v1', bakery);
  });

  afterEach(function() {
    identity = null;
  });

  it('can be instantiated with the proper config values', function() {
    assert.equal(identity.url, 'local/');
    assert.equal(identity.version, 'v1');
  });

  describe('_generatePath', function() {

    it('generates a valid url using provided args', function() {
      var path = identity._generatePath('search/', 'text=foo');
      assert.equal(path, 'local/v1/search/?text=foo');
    });
  });

  describe('getUser', function() {
    it('makes a request to fetch the ids', function() {
      identity.getUser('spinach');
      assert.equal(identity.bakery.sendGetRequest.callCount, 1);
    });

    it('calls the callback with the user data', function() {
      var callback = sinon.stub();
      identity.bakery.sendGetRequest.callsArgWith(1, {
        target: {
          responseText: '{"user": "spinach"}'
        }
      });
      identity.getUser('spinach', callback);
      assert.equal(callback.callCount, 1);
      assert.deepEqual(callback.args[0][1], {user: 'spinach'});
    });
  });
});

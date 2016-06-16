/* Copyright (C) 2016 Canonical Ltd. */

'use strict';

chai.config.includeStack = true;
chai.config.truncateThreshold = 0;

describe('jujulib plans service', function() {

  var makeXHRRequest = function(obj) {
    return {target: {responseText: JSON.stringify(obj)}};
  };

  it('exists', function() {
    var bakery = {};
    var plans = new window.jujulib.plans('http://1.2.3.4/', bakery);
    assert.strictEqual(plans instanceof window.jujulib.plans, true);
    assert.strictEqual(
      plans.url, 'http://1.2.3.4/' + window.jujulib.plansAPIVersion);
  });

  it('is smart enough to handle missing trailing slash in URL', function() {
    var bakery = {};
    var plans = new window.jujulib.plans('http://1.2.3.4', bakery);
    assert.strictEqual(
      plans.url, 'http://1.2.3.4/' + window.jujulib.plansAPIVersion);
  });

  it('lists plans for a charm', function(done) {
    var bakery = {
      sendGetRequest: function(path, success, failure) {
        assert.equal(
          path,
          'http://1.2.3.4/' +
          window.jujulib.plansAPIVersion +
          '/charm?charm-url=cs:juju-gui-42');
        var xhr = makeXHRRequest([{
          url: 'canonical-landscape/24-7',
          plan: '1',
          'created-on': '2016-06-09T22:07:24Z',
          description: 'Delivers the highest level of support.',
          price: 'the/price'
        }, {
          url: 'canonical-landscape/8-5',
          plan: 'B',
          'created-on': '2016-06-09T22:07:24Z',
          description: 'Offers a high level of support.',
          price: 'the/price'
        }, {
          url: 'canonical-landscape/free',
          plan: '9 from outer space',
          'created-on': '2015-06-09T22:07:24Z',
          description: 'No support available.',
          price: 'Free'
        }]);
        success(xhr);
      }
    };
    var plans = new window.jujulib.plans('http://1.2.3.4/', bakery);
    plans.listPlansForCharm('cs:juju-gui-42', function(error, plans) {
      assert.strictEqual(error, null);
      assert.deepEqual(plans, [{
        url: 'canonical-landscape/24-7',
        yaml: '1',
        createdAt: new Date(1465510044000),
        description: 'Delivers the highest level of support.',
        price: 'the/price'
      }, {
        url: 'canonical-landscape/8-5',
        yaml: 'B',
        createdAt: new Date(1465510044000),
        description: 'Offers a high level of support.',
        price: 'the/price'
      }, {
        url: 'canonical-landscape/free',
        yaml: '9 from outer space',
        createdAt: new Date(1433887644000),
        description: 'No support available.',
        price: 'Free'
      }]);
      done();
    });
  });

  it('adds the charm schema prefix when listing plans', function(done) {
    var bakery = {
      sendGetRequest: function(path, success, failure) {
        assert.equal(
          path,
          'http://1.2.3.4/' +
          window.jujulib.plansAPIVersion +
          '/charm?charm-url=cs:django');
        var xhr = makeXHRRequest([]);
        success(xhr);
      }
    };
    var plans = new window.jujulib.plans('http://1.2.3.4/', bakery);
    plans.listPlansForCharm('django', function(error, plans) {
      assert.strictEqual(error, null);
      done();
    });
  });

  it('handles missing plans', function(done) {
    var bakery = {
      sendGetRequest: function(path, success, failure) {
        var xhr = makeXHRRequest([]);
        success(xhr);
      }
    };
    var plans = new window.jujulib.plans('http://1.2.3.4/', bakery);
    plans.listPlansForCharm('cs:juju-gui/42', function(error, plans) {
      assert.strictEqual(error, null);
      assert.deepEqual(plans, []);
      done();
    });
  });

  it('handles errors listing plans', function(done) {
    var bakery = {
      sendGetRequest: function(path, success, failure) {
        var xhr = makeXHRRequest({error: 'bad wolf'});
        failure(xhr);
      }
    };
    var plans = new window.jujulib.plans('http://1.2.3.4/', bakery);
    plans.listPlansForCharm('django', function(error, plans) {
      assert.equal(error, 'bad wolf');
      assert.strictEqual(plans, null);
      done();
    });
  });

  it('retrieves the active plan for a given model and app', function(done) {
    var bakery = {
      sendGetRequest: function(path, success, failure) {
        assert.equal(
          path,
          'http://1.2.3.4/' +
          window.jujulib.plansAPIVersion +
          '/status/uuid/app-name');
        var xhr = makeXHRRequest({
          'current-plan': 'canonical-landscape/free',
          'available-plans': {
            'canonical-landscape/8-5': {
              url: 'canonical-landscape/8-5',
              plan: 'B',
              'created-on': '2016-06-09T22:07:24Z',
              description: 'Offers a high level of support.',
              price: 'the/price'
            },
            'canonical-landscape/free': {
              url: 'canonical-landscape/free',
              plan: '9 from outer space',
              'created-on': '2015-06-09T22:07:24Z',
              description: 'No support available.',
              price: 'Free'
            }
          }
        });
        success(xhr);
      }
    };
    var plans = new window.jujulib.plans('http://1.2.3.4/', bakery);
    plans.showActivePlan('uuid', 'app-name', function(error, current, all) {
      assert.strictEqual(error, null);
      assert.deepEqual(current, {
        url: 'canonical-landscape/free',
        yaml: '9 from outer space',
        createdAt: new Date(1433887644000),
        description: 'No support available.',
        price: 'Free'
      });
      assert.deepEqual(all, [{
        url: 'canonical-landscape/8-5',
        yaml: 'B',
        createdAt: new Date(1465510044000),
        description: 'Offers a high level of support.',
        price: 'the/price'
      }, {
        url: 'canonical-landscape/free',
        yaml: '9 from outer space',
        createdAt: new Date(1433887644000),
        description: 'No support available.',
        price: 'Free'
      }]);
      done();
    });
  });

  it('handles errors retrieving the currently active plan', function(done) {
    var bakery = {
      sendGetRequest: function(path, success, failure) {
        var xhr = makeXHRRequest({error: 'bad wolf'});
        failure(xhr);
      }
    };
    var plans = new window.jujulib.plans('http://1.2.3.4/', bakery);
    plans.showActivePlan('uuid', 'app-name', function(error, current, all) {
      assert.equal(error, 'bad wolf');
      assert.strictEqual(current, null);
      assert.deepEqual(all, []);
      done();
    });
  });

  fit('can authorise a plan', function(done) {
    var bakery = {
      sendPostRequest: function(path, params, success, failure) {
        assert.equal(
          path,
          'http://1.2.3.4/' +
          window.jujulib.plansAPIVersion +
          '/plan/authorize');
        var xhr = makeXHRRequest({
          'this-is-a': 'macaroon'
        });
        success(xhr);
      }
    };
    var plans = new window.jujulib.plans('http://1.2.3.4/', bakery);
    plans.authorize(
      'uuid', 'cs:trusty/django-9', 'my-django', 'my-plan', 'budget', 'limit',
      function(error, response) {
      assert.strictEqual(error, null);
      assert.deepEqual(reponse, {'this-is-a': 'macaroon'});
      done();
    });
  });

  it('handles errors authorising a plan', function(done) {
    var bakery = {
      sendPostRequest: function(path, params, success, failure) {
        var xhr = makeXHRRequest({error: 'bad wolf'});
        failure(xhr);
      }
    };
    var plans = new window.jujulib.plans('http://1.2.3.4/', bakery);
    plans.authorize(
      'uuid', 'cs:trusty/django-9', 'my-django', 'my-plan', 'budget', 'limit',
      function(error, response) {
        assert.equal(error, 'bad wolf');
        assert.strictEqual(response, null);
      done();
    });
  });

});

'use strict';

(function() {

 describe('browser fullscreen view', function() {
    var browser, container, FullScreen, view, views, Y;

    before(function(done) {
      Y = YUI(GlobalConfig).use(
          'juju-views',
          'juju-browser',
          'juju-tests-utils',
          'subapp-browser-fullscreen', function(Y) {
            browser = Y.namespace('juju.browser');
            views = Y.namespace('juju.browser.views');
            FullScreen = views.FullScreen;
            done();
          });
    });

    beforeEach(function() {
      container = Y.namespace('juju-tests.utils').makeContainer('container');
      addBrowserContainer(Y);
      // Mock out a dummy location for the Store used in view instances.
      window.juju_config = {
        charmworldURL: 'http://localhost'
      };

    });

    var addBrowserContainer = function(Y) {
      Y.Node.create('<div id="subapp-browser">' +
                    '</div>').appendTo(container);
    };

    afterEach(function() {
      view.destroy();
      Y.one('#subapp-browser').remove(true);
      delete window.juju_config;
      container.remove(true);
    });

    it('knows that it is fullscreen', function() {
      view = new FullScreen();
      view.isFullscreen().should.equal(true);
    });

    // Ensure the search results are rendered inside the container.
    it('must correctly render the initial browser ui', function() {
      var container = Y.one('#subapp-browser');

      view = new FullScreen();
      view.render(container);

      // And the hide button is rendered to the container node.
      assert.isTrue(Y.Lang.isObject(container.one('#bws-fullscreen')));
      // Also verify that the search widget has rendered into the view code.
      assert.isTrue(Y.Lang.isObject(container.one('input')));
    });

    it('reroutes to minimized when toggled', function(done) {
      var container = Y.one('#subapp-browser');
      view = new FullScreen();
      view.on('viewNavigate', function(ev) {
        assert(ev.change.viewmode === 'minimized');
        done();
      });
      view.render(container);
      container.one('.bws-icon').simulate('click');
    });

  });
})();


(function() {
  describe('browser sidebar view', function() {
    var Y, browser, container, view, views, Sidebar;

    before(function(done) {
      Y = YUI(GlobalConfig).use(
          'juju-browser',
          'juju-views',
          'juju-tests-utils',
          'node-event-simulate',
          'subapp-browser-sidebar',
          function(Y) {
            browser = Y.namespace('juju.browser');
            views = Y.namespace('juju.browser.views');
            Sidebar = views.Sidebar;
            done();
          });
    });

    beforeEach(function() {
      container = Y.namespace('juju-tests.utils').makeContainer('container');
      addBrowserContainer(Y);
      // Mock out a dummy location for the Store used in view instances.
      window.juju_config = {
        charmworldURL: 'http://localhost'
      };
    });

    afterEach(function() {
      view.destroy();
      Y.one('#subapp-browser').remove(true);
      delete window.juju_config;
      container.remove(true);
    });

  var addBrowserContainer = function(Y) {
    Y.Node.create('<div id="subapp-browser">' +
        '</div>').appendTo(container);
  };


    it('knows that it is not fullscreen', function() {
      view = new Sidebar();
      view.isFullscreen().should.equal(false);
    });

    it('reroutes to minimized when toggled', function(done) {
      var container = Y.one('#subapp-browser');
      view = new Sidebar();
      view.on('viewNavigate', function(ev) {
        assert(ev.change.viewmode === 'minimized');
        done();
      });
      view.render(container);
      container.one('.bws-icon').simulate('click');
    });

    it('must correctly render the initial browser ui', function() {
      var container = Y.one('#subapp-browser');
      view = new Sidebar();

      // mock out the data source on the view so that it won't actually make a
      // request.
      var emptyData = {
        responseText: Y.JSON.stringify({
          result: {
            'new': [],
            slider: []
          }
        })
      };

      view.get('store').set(
          'datasource',
          new Y.DataSource.Local({source: emptyData}));
      view.render(container);

      // And the hide button is rendered to the container node.
      assert.isTrue(Y.Lang.isObject(container.one('#bws-sidebar')));
      // Also verify that the search widget has rendered into the view code.
      assert.isTrue(Y.Lang.isObject(container.one('input')));
    });

  });
})();


(function() {
  describe('browser app', function() {
    var Y, app, browser;

    before(function(done) {
      Y = YUI(GlobalConfig).use(
          'app-subapp-extension',
          'juju-views',
          'juju-browser',
          'subapp-browser', function(Y) {
            browser = Y.namespace('juju.subapps');
            done();
          });
    });

    afterEach(function() {
      if (app) {
        app.destroy();
      }
    });

    it('verify that route callables exist', function() {
      app = new browser.Browser();
      Y.each(app.get('routes'), function(route) {
        assert.isTrue(typeof app[route.callback] === 'function');
      });
    });

  });

  describe('browser subapp display tree', function() {
    var Y, browser, container, hits, ns, resetHits;

    before(function(done) {
      Y = YUI(GlobalConfig).use(
          'app-subapp-extension',
          'juju-views',
          'juju-browser',
          'subapp-browser', function(Y) {
            browser = Y.namespace('juju.subapps');

            resetHits = function() {
              hits = {
                fullscreen: false,
                minimized: false,
                sidebar: false,
                renderCharmDetails: false,
                renderEditorial: false,
                renderSearchResults: false
              };
            };
            done();
          });
    });

    before(function(done) {
      Y = YUI(GlobalConfig).use(
          'juju-views',
          'juju-browser',
          'juju-tests-utils',
          'subapp-browser', function(Y) {
            ns = Y.namespace('juju.subapps');
            done();
          });
    });

    beforeEach(function() {
      container = Y.namespace('juju-tests.utils').makeContainer('container');
      Y.Node.create('<div id="subapp-browser-min"><div id="subapp-browser">' +
          '</div></div>').appendTo(container);

      // Track which render functions are hit.
      resetHits();

      // Mock out a dummy location for the Store used in view instances.
      window.juju_config = {
        charmworldURL: 'http://localhost'
      };

      browser = new ns.Browser();
      // Block out each render target so we only track it was hit.
      browser.renderCharmDetails = function() {
        hits.renderCharmDetails = true;
      };
      browser.renderEditorial = function() {
        hits.renderEditorial = true;
      };
      browser.renderSearchResults = function() {
        hits.renderSearchResults = true;
      };
      browser.minimized = function() {
        hits.minimized = true;
      };
      // showView needs to be hacked because it does the rendering of
      // fullscreen/sidebar.
      browser.showView = function(view) {
        hits[view] = true;
      };
    });

    afterEach(function() {
      browser.destroy();
      Y.one('#subapp-browser').remove(true);
    });

    it('bws-sidebar dispatches correctly', function() {
      var req = {
        path: '/bws/sidebar/',
        params: {
          viewmode: 'sidebar'
        }
      };
      var expected = Y.merge(hits, {
        sidebar: true,
        renderEditorial: true
      });

      browser.routeView(req, undefined, function() {});
      assert.deepEqual(hits, expected);
    });

    it('bws-sidebar-charmid dispatches correctly', function() {
      var req = {
        path: '/bws/sidebar/precise/apache2-2',
        params: {
          viewmode: 'sidebar',
          id: 'precise/apache2-2'
        }
      };
      var expected = Y.merge(hits, {
        sidebar: true,
        renderEditorial: true,
        renderCharmDetails: true
      });

      browser.routeView(req, undefined, function() {});
      assert.deepEqual(hits, expected);
    });

    it('bws-sidebar-search-charmid dispatches correctly', function() {
      var req = {
        path: '/bws/sidebar/search/precise/apache2-2',
        params: {
          viewmode: 'sidebar',
          id: 'precise/apache2-2'
        }
      };
      var expected = Y.merge(hits, {
        sidebar: true,
        renderSearchResults: true,
        renderCharmDetails: true
      });

      browser.routeView(req, undefined, function() {});
      assert.deepEqual(hits, expected);
    });

    it('bws-fullscreen dispatches correctly', function() {
      var req = {
        path: '/bws/fullscreen/',
        params: {
          viewmode: 'fullscreen'
        }
      };
      var expected = Y.merge(hits, {
        fullscreen: true,
        renderEditorial: true
      });

      browser.routeView(req, undefined, function() {});
      assert.deepEqual(hits, expected);
    });

    it('fullscreen-charmid dispatches correctly', function() {
      var req = {
        path: '/bws/fullscreen/precise/apache2-2',
        params: {
          viewmode: 'fullscreen',
          id: 'precise/apache2-2'
        }
      };
      var expected = Y.merge(hits, {
        fullscreen: true,
        renderCharmDetails: true
      });

      browser.routeView(req, undefined, function() {});
      assert.deepEqual(hits, expected);
    });

    it('fullscreen-search-charmid dispatches correctly', function() {
      var req = {
        path: '/bws/fullscreen/search/precise/apache2-2',
        params: {
          viewmode: 'fullscreen',
          id: 'precise/apache2-2'
        }
      };
      var expected = Y.merge(hits, {
        fullscreen: true,
        renderCharmDetails: true
      });

      browser.routeView(req, undefined, function() {});
      assert.deepEqual(hits, expected);
    });

    it('sidebar to sidebar-charmid dispatches correctly', function() {
      var req = {
        path: '/bws/sidebar/',
        params: {
          viewmode: 'sidebar'
        }
      };
      browser.routeView(req, undefined, function() {});

      // Now route through to the charmid from here and we should not hit the
      // editorial content again.
      resetHits();
      req = {
        path: '/bws/sidebar/precise/apache2-2',
        params: {
          viewmode: 'sidebar',
          id: 'precise/apache2-2'
        }
      };

      var expected = Y.merge(hits, {
        renderCharmDetails: true
      });

      browser.routeView(req, undefined, function() {});
      assert.deepEqual(hits, expected);
    });

    it('sidebar-details to sidebar dispatchse correctly', function() {
      var req = {
        path: '/bws/sidebar/precise/apache2-2',
        params: {
          viewmode: 'sidebar',
          id: 'precise/apache2-2'
        }
      };
      browser.routeView(req, undefined, function() {});

      // Reset the hits and we should not redraw anything to update the view.
      resetHits();
      req = {
        path: '/bws/sidebar/',
        params: {
          viewmode: 'sidebar'
        }
      };

      var expected = Y.merge(hits, {});
      browser.routeView(req, undefined, function() {});
      assert.deepEqual(hits, expected);
    });

    it('fullscreen to fullscreen-details dispatches correctly', function() {
      var req = {
        path: '/bws/fullscreen/',
        params: {
          viewmode: 'fullscreen'
        }
      };
      browser.routeView(req, undefined, function() {});

      // Now route through to the charmid from here and we should not hit the
      // editorial content again.
      resetHits();
      req = {
        path: '/bws/fullscreen/precise/apache2-2',
        params: {
          viewmode: 'fullscreen',
          id: 'precise/apache2-2'
        }
      };

      var expected = Y.merge(hits, {
        renderCharmDetails: true
      });

      browser.routeView(req, undefined, function() {});
      assert.deepEqual(hits, expected);
    });

    it('fullscreen-details to fullscreen renders editorial', function() {
      var req = {
        path: '/bws/fullscreen/precise/apache2-2',
        params: {
          viewmode: 'fullscreen',
          id: 'precise/apache2-2'
        }
      };
      browser.routeView(req, undefined, function() {});

      // Reset the hits and we should not redraw anything to update the view.
      resetHits();
      req = {
        path: '/bws/fullscreen/',
        params: {
          viewmode: 'fullscreen'
        }
      };

      var expected = Y.merge(hits, {
        renderEditorial: true
      });

      browser.routeView(req, undefined, function() {});
      assert.deepEqual(hits, expected);
    });

    it('sidebar to fullscreen dispatches correctly', function() {
      var req = {
        path: '/bws/sidebar',
        params: {
          viewmode: 'sidebar'
        }
      };
      browser.routeView(req, undefined, function() {});

      // Reset the hits and we should not redraw anything to update the view.
      resetHits();
      req = {
        path: '/bws/fullscreen/',
        params: {
          viewmode: 'fullscreen'
        }
      };

      var expected = Y.merge(hits, {
        fullscreen: true,
        renderEditorial: true
      });
      browser.routeView(req, undefined, function() {});
      assert.deepEqual(hits, expected);
    });

    it('changing the query string dispatches correctly', function() {
      var req = {
        path: '/bws/fullscreen/search/',
        params: {
          viewmode: 'fullscreen'
        },
        query: {
          text: 'test'
        }
      };
      browser.routeView(req, undefined, function() {});

      // Reset the hits and we should not redraw anything to update the view.
      resetHits();
      req.query.text = 'test2';

      var expected = Y.merge(hits, {
        renderSearchResults: true
      });
      browser.routeView(req, undefined, function() {});
      assert.deepEqual(hits, expected);
    });

    it('no change to query string does not redraw', function() {
      var req = {
        path: '/bws/fullscreen/search/',
        params: {
          viewmode: 'fullscreen'
        },
        query: {
          text: 'test'
        }
      };
      browser.routeView(req, undefined, function() {});

      // Reset the hits and we should not redraw anything to update the view.
      resetHits();

      var expected = Y.merge(hits);
      browser.routeView(req, undefined, function() {});
      assert.deepEqual(hits, expected);
    });

    it('handles searches with no querystring', function() {
      var req = {
        path: '/bws/fullscreen/search/',
        params: {
          viewmode: 'fullscreen'
        }
      };

      var expected = Y.merge(hits, {
        fullscreen: true,
        renderSearchResults: true
      });

      browser.routeView(req, undefined, function() {});
      assert.deepEqual(hits, expected);
    });

    it('routes to the minimized view', function() {
      var req = {
        path: '/bws/minimized',
        params: {
          viewmode: 'minimized'
        }
      };

      var expected = Y.merge(hits, {
        minimized: true
      });

      browser.routeView(req, undefined, function() {});
      assert.deepEqual(hits, expected);
    });

    it('when hidden the browser avoids routing', function() {
      browser.hidden = true;

      var req = {
        path: '/bws/minimized',
        params: {
          viewmode: 'minimized'
        }
      };
      var expected = Y.merge(hits);

      browser.routeView(req, undefined, function() {});
      assert.deepEqual(hits, expected);

      // And both nodes are hidden.
      var minNode = Y.one('#subapp-browser-min');
      var browserNode = Y.one('#subapp-browser');

      minNode.getComputedStyle('display').should.eql('none');
      browserNode.getComputedStyle('display').should.eql('none');
    });

  });
})();


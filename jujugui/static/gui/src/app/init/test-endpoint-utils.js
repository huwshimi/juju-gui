/* Copyright (C) 2017 Canonical Ltd. */
'use strict';

const endpointUtils = require('./endpoint-utils');
const factory = require('./testing-factory');
const User = require('../user/user');
const utils = require('./testing-utils');

const EndpointsController = require('./endpoints-controller');

const createApp = (JujuGUI, config = {}) => {
  const defaults = {
    apiAddress: 'http://api.example.com/',
    controllerSocketTemplate: 'wss://$server:$port/api',
    socket_protocol: 'wss',
    baseUrl: 'http://example.com/',
    charmstoreURL: 'http://1.2.3.4/',
    flags: {},
    gisf: false,
    plansURL: 'http://plans.example.com/',
    ratesURL: 'http://rates.example.com/',
    termsURL: 'http://terms.example.com/',
    identityURL: 'http://identity.example.com/'
  };
  // Overwrite any default values with those provided.
  const initConfig = Object.assign(defaults, config);
  return new JujuGUI(initConfig);
};


describe('Endpoints map handlers', function() {
  let app, container, controller, destroyMe, JujuGUI;

  beforeAll(done => {
    YUI(GlobalConfig).use([
      'datasource-local'],
    Y => {
      // init.js requires the window to contain the YUI object.
      window.yui = Y;
      // The gui version is required to be set by component-renderers-mixin.js.
      window.GUI_VERSION = {version: '1.2.3'};
      require('../yui-modules');
      window.yui.use(window.MODULES, function() {
        // The require needs to be after the yui modules have been loaded.
        JujuGUI = require('../init');
        done();
      });
    });
  });

  beforeEach(() => {
    destroyMe = [];
    container = utils.makeAppContainer();
    app = createApp(JujuGUI);
    controller = app.endpointsController;
    controller.endpointsMap = {};
  });

  afterEach(function() {
    app.destructor();
    container.remove();
    destroyMe.forEach(destroy => destroy.destroy());
    destroyMe = null;
  });

  it('should update endpoints map when pending services are added',
    function(done) {
      var applicationName = 'wordpress';
      var charmUrl = 'cs:precise/wordpress-2';
      app.db.charms.add({id: charmUrl});
      var charm = app.db.charms.getById(charmUrl);
      destroyMe.push(charm);
      charm.loaded = true;

      const handler = () => {
        controller.endpointsMap.should.eql({wordpress: {
          requires: [],
          provides: []}});
        // This will hang forever if the endpoint map doesn't update.
        document.removeEventListener('endpointMapAdded', handler);
        done();
      };
      document.addEventListener('endpointMapAdded', handler);
      app.db.services.add({
        id: applicationName,
        pending: true,
        loaded: true,
        charmstore: factory.makeFakeCharmstore(),
        charm: charmUrl
      });
    });
});

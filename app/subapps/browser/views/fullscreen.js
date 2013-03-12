'use strict';


YUI.add('subapp-browser-fullscreen', function(Y) {
  var ns = Y.namespace('juju.browser.views'),
      views = Y.namespace('juju.views'),
      widgets = Y.namespace('juju.widgets');

  /**
   * Browser Sub App for the Juju Gui.
   *
   * @class FullScreen
   * @extends {Y.View}
   *
   */
  ns.FullScreen = Y.Base.create('browser-view-fullscreen', Y.View, [], {
    template: views.Templates.fullscreen,

    /**
     * @attribute events
     *
     */
    events: {},

    /**
     * Gereral YUI initializer.
     *
     * @method initializer
     * @param {Object} cfg configuration object.
     *
     */
    initializer: function(cfg) {},

    /**
     * Render out the view to the DOM.
     *
     * @method render
     *
     */
    render: function(container) {
      var search = new widgets.browser.Search(),
          tpl = this.template(),
          tpl_node = Y.Node.create(tpl);

      search.render(tpl_node.one('.bws-search'));

      if (!Y.Lang.isValue(container)) {
        container = this.get('container');
      }
      container.setHTML(tpl_node);
    },

    /**
     * Destroy this view and clear from the dom world.
     *
     * @method destructor
     *
     */
    destructor: function() {}

  }, {
    ATTRS: {}
  });

}, '0.1.0', {
  requires: [
    'browser-search-widget',
    'view'
  ]
});

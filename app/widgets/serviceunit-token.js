/*
This file is part of the Juju GUI, which lets users view and manage Juju
environments within a graphical interface (https://launchpad.net/juju-gui).
Copyright (C) 2012-2013 Canonical Ltd.

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU Affero General Public License version 3, as published by
the Free Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranties of MERCHANTABILITY,
SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
General Public License for more details.

You should have received a copy of the GNU Affero General Public License along
with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';


/**
 * Provides the Unit widget, for handling the deployment of units to machines
 * or containers.
 *
 * @module views
 */
YUI.add('juju-serviceunit-token', function(Y) {

  var views = Y.namespace('juju.views'),
      Templates = views.Templates;

  /**
   * The view associated with the machine token.
   *
   * @class ServiceUnitToken
   */
  var ServiceUnitToken = Y.Base.create('ServiceUnitToken', Y.View, [
    Y.Event.EventTracker
  ], {
    template: Templates['serviceunit-token'],

    events: {
      '.unplaced-unit .token-move': {
        click: '_handleStartMove'
      },
      '.unplaced-unit .machines select': {
        change: '_handleMachineSelection'
      },
      '.unplaced-unit .containers select': {
        change: '_handleContainerSelection'
      },
      '.unplaced-unit .actions .move': {
        click: '_handleFinishMove'
      },
      '.unplaced-unit .actions .cancel': {
        click: '_handleCancel'
      }
    },

    /**
     * Handles clicks on the Move icon.
     *
     * @method _startMoveHandler
     * @param {Y.Event} e EventFacade object.
     */
    _handleStartMove: function(e) {
      e.preventDefault();
      var container = this.get('container');
      this._populateMachines();
      container.addClass('active');
      container.one('.token-move').hide();
      container.one('.title').hide();
      container.one('.machines').removeClass('hidden');
    },

    /**
     * Handles clicks on the Move action.
     *
     * @method _finishMoveHandler
     * @param {Y.Event} e EventFacade object.
     */
    _handleFinishMove: function(e) {
      e.preventDefault();
      var container = this.get('container');
      var machineValue = container.one(
          '.machines select option:checked').get('value');
      var containerValue = this.get('container').one(
          '.containers select option:checked').get('value');
      var constraintsForm = container.one('.constraints');
      var constraints = {};

      if (machineValue === 'new' || containerValue === 'new-kvm') {
        constraints.cpu = constraintsForm.one('input[name="cpu"]');
        constraints.ram = constraintsForm.one('input[name="ram"]');
        constraints.disk = constraintsForm.one('input[name="disk"]');
      }

      if (machineValue === 'new') {
        // Create a new machine using the constraints data.
      } else if (!containerValue) {
        // Do nothing, the user has not selected a container.
        return;
      } else if (containerValue === 'new-kvm') {
        // Create a new KVM container using the constraints data.
        // The machine will be 'machineValue'
      } else if (containerValue === 'new-lxc') {
        // Create a new LXC container.
        // The machine will be 'machineValue'
      } else {
        // Add the unit to the container.
        // The machine will be 'machineValue'
        // The container will be 'containerValue'
      }
      this.fire('moveToken');
      // The unit has been placed, remove it.
      this.destroy();
    },

    /**
     * Handles clicks on the cancel action.
     *
     * @method _handleCancel
     * @param {Y.Event} e EventFacade object.
     */
    _handleCancel: function(e) {
      e.preventDefault();
      var container = this.get('container'),
          attrs = this.getAttrs();
      // In lieu of resetting every element, just re-render the html.
      container.setHTML(this.template(attrs));
      // Remove the active class
      container.removeClass('active');
    },

    /**
     * Handles changes to the machine selection
     *
     * @method _handleMachineSelection
     * @param {Y.Event} e EventFacade object.
     */
    _handleMachineSelection: function(e) {
      e.preventDefault();
      var container = this.get('container');
      var machineValue = this.get('container').one(
          '.machines select option:checked').get('value');
      // Hide both options in case the machine has been changed.
      container.one('.containers').addClass('hidden');
      container.one('.new-machine').addClass('hidden');
      container.one('.constraints').addClass('hidden');

      if (machineValue === 'new') {
        container.one('.new-machine').removeClass('hidden');
        container.one('.constraints').removeClass('hidden');
      } else {
        this._populateContainers(machineValue);
        container.one('.containers').removeClass('hidden');
      }
      container.one('.actions').removeClass('hidden');
    },

    /**
     * Handles changes to the container selection
     *
     * @method _handleContainerSelection
     * @param {Y.Event} e EventFacade object.
     */
    _handleContainerSelection: function(e) {
      e.preventDefault();
      var container = this.get('container');
      var containerValue = this.get('container').one(
          '.containers select option:checked').get('value');
      // Hide the constraints in case the container has been changed.
      container.one('.constraints').addClass('hidden');

      if (containerValue === 'new-kvm') {
        container.one('.constraints').removeClass('hidden');
      }
    },

    /**
      Populate the select with the current machines.

      @method _populateMachines
    */
    _populateMachines: function() {
      var machinesSelect = this.get('container').one('.machines select');
      var machines = this.get('db').machines.filterByParent(null);
      // Remove current machines. Leave the default options.
      machinesSelect.all('option:not(.default)').remove();
      // Sort machines by id.
      machines.sort(function(obj1, obj2) {
        return obj1.id - obj2.id;
      });
      // Add all the machines to the select
      machines.forEach(function(machine) {
        machinesSelect.append(this._createMachineOption(machine));
      }, this);
    },

    /**
      Populate the select with the current containers.

      @method _populateContainers
      @param {String} parentID A machine id
    */
    _populateContainers: function(parentId) {
      var containersSelect = this.get('container').one('.containers select');
      var containers = this.get('db').machines.filterByParent(parentId);
      // Remove current containers. Leave the default options.
      containersSelect.all('option:not(.default)').remove();
      // Sort containers by id.
      containers.sort(function(obj1, obj2) {
        // Need to reverse the order as the order will be reversed again
        // when the items are prepended, no appended.
        return obj2.id.split('/')[2] - obj1.id.split('/')[2];
      });
      // Add all the containers to the select.
      containers.forEach(function(container) {
        containersSelect.prepend(this._createMachineOption(container));
      }, this);
      // Add the bare metal container to the top of the list.
      containersSelect.prepend(this._createMachineOption(
          {displayName: parentId + '/bare metal', id: ''}));
    },

    /**
      Create an option for a machine or container.

      @method _createMachineOption
      @param {Object} machine A machine object
    */
    _createMachineOption: function(machine) {
      var option = Y.Node.create('<option></option>');
      option.set('value', machine.id);
      option.set('text', machine.displayName);
      return option;
    },

    /**
      Makes the token draggable so it can be dropped on a machine, container,
      or column header.

      @method _makeDraggable
    */
    _makeDraggable: function() {
      var container = this.get('container');
      container.setAttribute('draggable', 'true');
      this.addEvent(container.on('dragstart',
          this._makeDragStartHandler(this.getAttrs()), this));
      this.addEvent(container.on('dragend', this._fireDragEndEvent, this));
    },

    /**
      Fires the unit-token-drag-end event

      @method _fireDragEndEvent
    */
    _fireDragEndEvent: function() {
      this.fire('unit-token-drag-end');
    },

    /**
      Generate a function that generates the drag start handler data when
      the drag starts.

      @method _makeDragStartHandler
      @param {Object} attrs The tokens attributes.
      @return {Function} The drag start handler function.
    */
    _makeDragStartHandler: function(attrs) {
      return function(e) {
        var evt = e._event; // We need the real event not the YUI wrapped one.
        var dataTransfer = evt.dataTransfer;
        dataTransfer.effectAllowed = 'move';
        var dragData = {
          id: attrs.id
        };
        dataTransfer.setData('Text', JSON.stringify(dragData));
        // This event is registered on many nested elements, but we only have
        // to handle the drag start once, so stop now.
        evt.stopPropagation();
        this.fire('unit-token-drag-start');
      };
    },

    /**
     * Sets up the DOM nodes and renders them to the DOM.
     *
     * @method render
     */
    render: function() {
      var container = this.get('container'),
          unit = this.get('unit'),
          token;
      container.setHTML(this.template(unit));
      container.addClass('serviceunit-token');
      token = container.one('.unplaced-unit');
      // This must be setAttribute, not setData, as setData does not
      // manipulate the dom, which we need for our namespaced code
      // to read.
      token.setAttribute('data-id', unit.id);
      this._makeDraggable();
      return this;
    },

    /**
      Removes the view container and all its contents.

      @method destructor
    */
    destructor: function() {
      this.get('container').remove();
    },

    ATTRS: {
      /**
        The Node instance that contains this token.

        @attribute container
        @type {Object}
       */
      container: {},

      /**
        The model wrapped by this token.

        @attribute unit
        @type {Object}
       */
      unit: {}

      /**
        Reference to the application db

        @attribute db
        @type {Object}
       */
      db: {},
    }
  });

  views.ServiceUnitToken = ServiceUnitToken;

}, '0.1.0', {
  requires: [
    'base',
    'view',
    'event-tracker',
    'node',
    'juju-templates',
    'handlebars'
  ]
});

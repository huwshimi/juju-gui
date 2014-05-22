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

describe('Service unit token', function() {
  var container, utils, models, views, view, id, title, Y;

  before(function(done) {
    Y = YUI(GlobalConfig).use(['juju-serviceunit-token',
                               'juju-models',
                               'juju-tests-utils',
                               'node-event-simulate'], function(Y) {
      models = Y.namespace('juju.models');
      views = Y.namespace('juju.views');
      utils = Y.namespace('juju-tests.utils');
      done();
    });
  });

  beforeEach(function() {
    container = utils.makeContainer(this, 'container');
    id = 'test/0';
    title = 'test';
    view = new views.ServiceUnitToken({
      container: container,
      unit: {
        id: 'test/0',
        displayName: 'test'
      },
      db: {
        machines: new models.MachineList()
      },
      env: {}
    }).render();
    view.get('db').machines.add([{id: '0'}]);
  });

  afterEach(function() {
    view.destroy();
  });

  it('renders to initial, undeployed state', function() {
    var selector = '.unplaced-unit';
    assert.notEqual(container.one(selector), null,
                    'DOM element not found');
    assert.equal(container.one(selector + ' .title').get('text').trim(),
                 title, 'display names do not match');
  });

  it('makes itself draggable on render', function() {
    assert.equal(view.get('container').getAttribute('draggable'), 'true');
  });

  it('adds the unit id to the drag data', function() {
    var handler = view._makeDragStartHandler({ id: 'foo' });
    var dragData = {
      _event: {
        dataTransfer: {
          setData: utils.makeStubFunction()
        },
        stopPropagation: utils.makeStubFunction() }};
    handler.call(view, dragData);
    var dragEvent = dragData._event;
    assert.equal(dragEvent.stopPropagation.calledOnce(), true);
    assert.equal(dragEvent.dataTransfer.setData.calledOnce(), true);
    var setArgs = dragEvent.dataTransfer.setData.lastArguments();
    assert.equal(setArgs[0], 'Text');
    assert.equal(setArgs[1], '{"id":"foo"}');
  });

  it('can show the machine selection', function() {
    var machinesNode = container.one('.machines');
    var titleNode = container.one('.title');
    var moveNode = container.one('.token-move');
    // Check the initial state.
    assert.equal(container.hasClass('active'), false);
    assert.equal(machinesNode.hasClass('hidden'), true);
    assert.notEqual(titleNode.getStyle('display'), 'none');
    assert.notEqual(moveNode.getStyle('display'), 'none');
    // Show the machine selection.
    moveNode.simulate('click');
    assert.equal(machinesNode.hasClass('hidden'), false);
    assert.equal(container.hasClass('active'), true);
    assert.equal(titleNode.getStyle('display'), 'none');
    assert.equal(moveNode.getStyle('display'), 'none');
  });

  it('can populate the machines selection', function() {
    var machinesSelect = container.one('.machines select');
    var moveNode = container.one('.token-move');
    assert.equal(machinesSelect.all('option').size(), 2,
        'The defaults should exist');
    // Show the machine selection.
    moveNode.simulate('click');
    var machineOptions = machinesSelect.all('option');
    assert.equal(machineOptions.size(), 3);
    assert.equal(machineOptions.item(2).get('value'), '0');
  });

  it('orders the machines list correctly', function() {
    var machinesSelect = container.one('.machines select');
    var moveNode = container.one('.token-move');
    view.get('db').machines.add([{id: '2'}, {id: '1'}]);
    // Show the machine selection.
    moveNode.simulate('click');
    var machineOptions = machinesSelect.all('option');
    assert.equal(machineOptions.item(2).get('value'), '0');
    assert.equal(machineOptions.item(3).get('value'), '1');
    assert.equal(machineOptions.item(4).get('value'), '2');
  });

  it('can show the new machine form', function() {
    var machinesSelect = container.one('.machines select');
    var constraintsNode = container.one('.constraints');
    var containersNode = container.one('.containers');
    var newMachineNode = container.one('.new-machine');
    var actionsNode = container.one('.actions');
    // Check the initial state.
    assert.equal(containersNode.hasClass('hidden'), true);
    assert.equal(newMachineNode.hasClass('hidden'), true);
    assert.equal(constraintsNode.hasClass('hidden'), true);
    assert.equal(actionsNode.hasClass('hidden'), true);
    // Select the 'New machine' option.
    machinesSelect.set('selectedIndex', 1);
    machinesSelect.simulate('change');
    assert.equal(containersNode.hasClass('hidden'), true);
    assert.equal(newMachineNode.hasClass('hidden'), false);
    assert.equal(constraintsNode.hasClass('hidden'), false);
    assert.equal(actionsNode.hasClass('hidden'), false);
  });

  it('can show the container selection', function() {
    var machinesSelect = container.one('.machines select');
    var constraintsNode = container.one('.constraints');
    var containersNode = container.one('.containers');
    var newMachineNode = container.one('.new-machine');
    var actionsNode = container.one('.actions');
    // Check the initial state.
    assert.equal(containersNode.hasClass('hidden'), true);
    assert.equal(newMachineNode.hasClass('hidden'), true);
    assert.equal(constraintsNode.hasClass('hidden'), true);
    assert.equal(actionsNode.hasClass('hidden'), true);
    // Select a machine option.
    machinesSelect.set('selectedIndex', 2);
    machinesSelect.simulate('change');
    assert.equal(containersNode.hasClass('hidden'), false);
    assert.equal(newMachineNode.hasClass('hidden'), true);
    assert.equal(constraintsNode.hasClass('hidden'), true);
    assert.equal(actionsNode.hasClass('hidden'), false);
  });

  it('hides the container list/new machine form on machine selection changed',
      function() {
        var machinesSelect = container.one('.machines select');
        var constraintsNode = container.one('.constraints');
        var containersNode = container.one('.containers');
        var newMachineNode = container.one('.new-machine');
        // Select a machine option.
        machinesSelect.set('selectedIndex', 2);
        machinesSelect.simulate('change');
        assert.equal(containersNode.hasClass('hidden'), false);
        assert.equal(newMachineNode.hasClass('hidden'), true);
        assert.equal(constraintsNode.hasClass('hidden'), true);
        // Select the 'New machine' option.
        machinesSelect.set('selectedIndex', 1);
        machinesSelect.simulate('change');
        assert.equal(containersNode.hasClass('hidden'), true);
        assert.equal(newMachineNode.hasClass('hidden'), false);
        assert.equal(constraintsNode.hasClass('hidden'), false);
      });

  it('can populate the containers selection', function() {
    var machinesSelect = container.one('.machines select');
    var containersSelect = container.one('.containers select');
    var selectedMachineStub = utils.makeStubMethod(view,
        '_getSelectedMachine', '0');
    this._cleanups.push(selectedMachineStub.reset);
    view.get('db').machines.add([{id: '0/lxc/1'}]);
    assert.equal(containersSelect.all('option').size(), 3,
        'The defaults should exist');
    // Select a machine option.
    machinesSelect.simulate('change');
    var containerOptions = containersSelect.all('option');
    assert.equal(containerOptions.size(), 5);
    assert.equal(containerOptions.item(1).get('value'), '0/lxc/1');
    // Check the bare metal option has been created at the top of the list.
    assert.equal(containerOptions.item(0).get('value'), 'bare-metal');
    assert.equal(containerOptions.item(0).get('text'), '0/bare metal');
  });

  it('orders the containers list correctly', function() {
    var machinesSelect = container.one('.machines select');
    var containersSelect = container.one('.containers select');
    var selectedMachineStub = utils.makeStubMethod(view,
        '_getSelectedMachine', '0');
    this._cleanups.push(selectedMachineStub.reset);
    view.get('db').machines.add([
      {id: '0/lxc/1'},
      {id: '0/lxc/3'},
      {id: '0/lxc/2'}
    ]);
    // Select a machine option.
    machinesSelect.simulate('change');
    var containerOptions = containersSelect.all('option');
    assert.equal(containerOptions.item(1).get('value'), '0/lxc/1');
    assert.equal(containerOptions.item(2).get('value'), '0/lxc/2');
    assert.equal(containerOptions.item(3).get('value'), '0/lxc/3');
  });

  it('shows the constraints for a new kvm container', function() {
    var containersSelect = container.one('.containers select');
    var constraintsNode = container.one('.constraints');
    // Check the initial state.
    assert.equal(constraintsNode.hasClass('hidden'), true);
    // Select the kvm option.
    containersSelect.set('selectedIndex', 2);
    containersSelect.simulate('change');
    assert.equal(constraintsNode.hasClass('hidden'), false);
  });

  it('does not show the constraints for non kvm containers', function() {
    var containersSelect = container.one('.containers select');
    var constraintsNode = container.one('.constraints');
    // Check the initial state.
    assert.equal(constraintsNode.hasClass('hidden'), true);
    // Select a non kvm option.
    containersSelect.set('selectedIndex', 1);
    containersSelect.simulate('change');
    assert.equal(constraintsNode.hasClass('hidden'), true);
  });

  it('hides constraints if the container is changed from kvm', function() {
    var containersSelect = container.one('.containers select');
    var constraintsNode = container.one('.constraints');
    // Select the kvm option.
    containersSelect.set('selectedIndex', 2);
    containersSelect.simulate('change');
    assert.equal(constraintsNode.hasClass('hidden'), false);
    // Select a non kvm option.
    containersSelect.set('selectedIndex', 1);
    containersSelect.simulate('change');
    assert.equal(constraintsNode.hasClass('hidden'), true);
  });

  it('resets the token on cancel', function() {
    var cancelNode = container.one('.actions .cancel');
    var machinesSelect = container.one('.machines select');
    var constraintsNode = container.one('.constraints');
    var newMachineNode = container.one('.new-machine');
    var actionsNode = container.one('.actions');
    var moveNode = container.one('.token-move');
    var titleNode = container.one('.title');
    // Show the machine selection.
    moveNode.simulate('click');
    // Select the 'New machine' option.
    machinesSelect.set('selectedIndex', 1);
    machinesSelect.simulate('change');
    assert.equal(container.hasClass('active'), true);
    assert.equal(titleNode.getStyle('display'), 'none');
    assert.equal(moveNode.getStyle('display'), 'none');
    assert.equal(newMachineNode.hasClass('hidden'), false);
    assert.equal(constraintsNode.hasClass('hidden'), false);
    assert.equal(actionsNode.hasClass('hidden'), false);
    // Cancel the move.
    cancelNode.simulate('click');
    // Need to get new references to the nodes as they've been recreated.
    constraintsNode = container.one('.constraints');
    newMachineNode = container.one('.new-machine');
    actionsNode = container.one('.actions');
    moveNode = container.one('.token-move');
    titleNode = container.one('.title');
    assert.equal(container.hasClass('active'), false);
    assert.notEqual(titleNode.getStyle('display'), 'none');
    assert.notEqual(moveNode.getStyle('display'), 'none');
    assert.equal(newMachineNode.hasClass('hidden'), true);
    assert.equal(constraintsNode.hasClass('hidden'), true);
    assert.equal(actionsNode.hasClass('hidden'), true);
  });
});

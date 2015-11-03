/*
This file is part of the Juju GUI, which lets users view and manage Juju
environments within a graphical interface (https://launchpad.net/juju-gui).
Copyright (C) 2015 Canonical Ltd.

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

var juju = {components: {}}; // eslint-disable-line no-unused-vars
var testUtils = React.addons.TestUtils;

describe('UnitList', () => {

  beforeAll((done) => {
    // By loading this file it adds the component to the juju components.
    YUI().use('unit-list', () => { done(); });
  });

  it('renders a list of unit components', () => {
    var units = [{
      displayName: 'mysql/0',
      id: 'mysql/0'
    }, {
      displayName: 'mysql/1',
      id: 'mysql/1'
    }];
    var output = jsTestUtils.shallowRender(
        <juju.components.UnitList
          units={units} />);
    var children = output.props.children[1].props.children;
    var refs = [
      'UnitListItem-' + units[0].id,
      'UnitListItem-' + units[1].id
    ];
    assert.deepEqual(children, [
      <juju.components.UnitListItem
        key="select-all"
        className="select-all"
        label="Select all units"
        checked={false}
        whenChanged={children[0].props.whenChanged}/>,
      <juju.components.UnitListItem
        key={units[0].displayName}
        ref={refs[0]}
        label={units[0].displayName}
        action={children[1].props.action}
        checked={false}
        unitId="mysql/0" />,
      <juju.components.UnitListItem
        key={units[1].displayName}
        ref={refs[1]}
        label={units[1].displayName}
        action={children[2].props.action}
        checked={false}
        unitId="mysql/1" />
    ]);
  });

  it('renders a grouped list of error unit components', () => {
    var units = [{
      displayName: 'mysql/0',
      id: 'mysql/0',
      agent_state_info: 'hook failed: install'
    }, {
      displayName: 'mysql/1',
      id: 'mysql/1',
      agent_state_info: 'hook failed: config-changed'
    }];
    var output = jsTestUtils.shallowRender(
        <juju.components.UnitList
          unitStatus='error'
          units={units} />);
    var children = output.props.children[1].props.children;
    var refs = [
      'UnitListItem-' + units[0].id,
      'UnitListItem-' + units[1].id
    ];
    assert.deepEqual(children, [
      <juju.components.UnitListItem
        key="select-all-0"
        className="select-all"
        label="hook failed: install"
        checked={false}
        whenChanged={children[0].props.whenChanged}/>,
      <juju.components.UnitListItem
        key={units[0].displayName}
        ref={refs[0]}
        label={units[0].displayName}
        action={children[1].props.action}
        checked={false}
        unitId="mysql/0" />,
      <juju.components.UnitListItem
        key="select-all-1"
        className="select-all"
        label="hook failed: config-changed"
        checked={false}
        whenChanged={children[2].props.whenChanged}/>,
      <juju.components.UnitListItem
        key={units[1].displayName}
        ref={refs[1]}
        label={units[1].displayName}
        action={children[3].props.action}
        checked={false}
        unitId="mysql/1" />
    ]);
  });

  it('renders the Scale Service action component', () => {
    var units = [{
      displayName: 'mysql/0'
    }];
    var output = jsTestUtils.shallowRender(
        <juju.components.UnitList
          units={units} />);
    var child = output.props.children[0].props.children;
    assert.deepEqual(child,
      <juju.components.OverviewAction
        action={child.props.action}
        title="Scale service"/>);
  });

  it('hides the actions when viewing a status list', () => {
    var units = [{
      displayName: 'mysql/0'
    }];
    var output = jsTestUtils.shallowRender(
        <juju.components.UnitList
          unitStatus="pending"
          units={units} />);
    var child = output.props.children[0];
    assert.deepEqual(child,
      <div className="unit-list__actions hidden">
        <juju.components.OverviewAction
          action={child.props.children.props.action}
          title="Scale service"/>
      </div>);
  });

  it('propagates select-all to all children', () => {
    var units = [{
      displayName: 'mysql/0',
      id: 'mysql/0'
    }, {
      displayName: 'mysql/1',
      id: 'mysql/1'
    }];
    var shallowRenderer = jsTestUtils.shallowRender(
        <juju.components.UnitList
          units={units} />, true);
    var output = shallowRenderer.getRenderOutput();
    var selectAll = output.props.children[1].props.children[0];

    // Trigger the select callback;
    selectAll.props.whenChanged(true);
    // re-render the component
    shallowRenderer.render(
        <juju.components.UnitList
          units={units} />);
    output = shallowRenderer.getRenderOutput();

    var children = output.props.children[1].props.children;
    var refs = [
      'UnitListItem-' + units[0].id,
      'UnitListItem-' + units[1].id
    ];
    assert.deepEqual(children, [
      <juju.components.UnitListItem
        key="select-all"
        className="select-all"
        label="Select all units"
        checked={true}
        whenChanged={children[0].props.whenChanged}/>,
      <juju.components.UnitListItem
        key={units[0].displayName}
        ref={refs[0]}
        label={units[0].displayName}
        action={output.props.children[1].props.children[1].props.action}
        checked={true}
        unitId="mysql/0" />,
      <juju.components.UnitListItem
        key={units[1].displayName}
        ref={refs[1]}
        label={units[1].displayName}
        action={output.props.children[1].props.children[2].props.action}
        checked={true}
        unitId="mysql/1" />
    ]);
  });

  it('navigates to the unit when a list item is clicked', function() {
    var units = [{
      displayName: 'mysql/5',
      id: 'mysql/5'
    }];
    var changeState = sinon.stub();
    var output = jsTestUtils.shallowRender(
        <juju.components.UnitList
          changeState={changeState}
          serviceId="mysql"
          unitStatus={null}
          units={units} />);
    output.props.children[1].props.children[1].props.action({
      currentTarget: {
        getAttribute: function() {
          return 'mysql/5';
        }
      }
    });
    assert.equal(changeState.callCount, 1);
    assert.deepEqual(changeState.args[0][0], {
      sectionA: {
        component: 'inspector',
        metadata: {
          id: 'mysql',
          unit: '5',
          activeComponent: 'unit'
        }
      }
    });
  });

  it('navigates to the remote service unit when a list item is clicked', () => {
    // A subordinate shows the remote service unit.
    var units = [{
      displayName: 'wordpress/5',
      id: 'wordpress/5'
    }];
    var changeState = sinon.stub();
    var output = jsTestUtils.shallowRender(
        <juju.components.UnitList
          changeState={changeState}
          serviceId="nrpe"
          unitStatus={null}
          units={units} />);
    output.props.children[1].props.children[1].props.action({
      currentTarget: {
        getAttribute: function() {
          return 'wordpress/5';
        }
      }
    });
    assert.equal(changeState.callCount, 1);
    assert.deepEqual(changeState.args[0][0], {
      sectionA: {
        component: 'inspector',
        metadata: {
          id: 'wordpress',
          unit: '5',
          activeComponent: 'unit'
        }
      }
    });
  });

  it('only displays a remove button for a non-error list', function() {
    var output = jsTestUtils.shallowRender(
        <juju.components.UnitList
          units={[]} />);
    var buttonItems = output.props.children[2].props.buttons;
    var buttons = [{
      title: 'Remove',
      action: buttonItems[0].action
    }];
    assert.deepEqual(output.props.children[2],
      <juju.components.ButtonRow
        buttons={buttons} />);
    assert.equal(buttonItems.length, 1);
  });

  it('displays a Resolve & retry button for an error list', function() {
    var output = jsTestUtils.shallowRender(
        <juju.components.UnitList
          unitStatus='error'
          units={[]} />);
    var buttonItems = output.props.children[2].props.buttons;
    var buttons = [{
      title: 'Resolve & retry',
      action: buttonItems[0].action
    }, {
      title: 'Remove',
      action: buttonItems[1].action
    }];
    assert.deepEqual(output.props.children[2],
      <juju.components.ButtonRow
        buttons={buttons} />);
    assert.equal(buttonItems.length, 2);
  });

  it('can remove the selected units', function() {
    var destroyUnits = sinon.stub();
    var changeState = sinon.stub();
    var units = [{
      displayName: 'mysql/0',
      id: 'mysql/0'
    }, {
      displayName: 'mysql/1',
      id: 'mysql/1'
    }, {
      displayName: 'mysql/2',
      id: 'mysql/2'
    }];
    // Have to use renderIntoDocument here as shallowRenderer does not support
    // refs.
    var output = testUtils.renderIntoDocument(
        <juju.components.UnitList
          destroyUnits={destroyUnits}
          changeState={changeState}
          serviceId="service1"
          units={units} />);
    output.refs['UnitListItem-' + units[0].id].setState({checked: true});
    output.refs['UnitListItem-' + units[2].id].setState({checked: true});
    var button = testUtils.findRenderedDOMComponentWithClass(
        output, 'generic-button');
    testUtils.Simulate.click(button);
    assert.equal(destroyUnits.callCount, 1);
    assert.deepEqual(destroyUnits.args[0][0], [units[0].id, units[2].id]);
  });

  it('deselects all units after removal', function() {
    var destroyUnits = sinon.stub();
    var changeState = sinon.stub();
    var units = [{
      displayName: 'mysql/0',
      id: 'mysql/0'
    }];
    // Have to use renderIntoDocument here as shallowRenderer does not support
    // refs.
    var output = testUtils.renderIntoDocument(
        <juju.components.UnitList
          destroyUnits={destroyUnits}
          changeState={changeState}
          serviceId="service1"
          units={units} />);
    output.refs['UnitListItem-' + units[0].id].setState({checked: true});
    var button = testUtils.findRenderedDOMComponentWithClass(
        output, 'generic-button');
    testUtils.Simulate.click(button);
    assert.isFalse(output.refs['UnitListItem-' + units[0].id].state.checked);
  });

  it('can resolve the selected units', function() {
    var destroyUnits = sinon.stub();
    var changeState = sinon.stub();
    var envResolved = sinon.stub();
    var units = [{
      displayName: 'mysql/0',
      id: 'mysql/0'
    }, {
      displayName: 'mysql/1',
      id: 'mysql/1'
    }, {
      displayName: 'mysql/2',
      id: 'mysql/2'
    }];
    // Have to use renderIntoDocument here as shallowRenderer does not support
    // refs.
    var output = testUtils.renderIntoDocument(
        <juju.components.UnitList
          unitStatus='error'
          envResolved={envResolved}
          changeState={changeState}
          serviceId="service1"
          units={units} />);
    output.refs['UnitListItem-' + units[0].id].setState({checked: true});
    output.refs['UnitListItem-' + units[1].id].setState({checked: true});
    var button = testUtils.scryRenderedDOMComponentsWithClass(
        output, 'generic-button')[0];
    testUtils.Simulate.click(button);
    assert.equal(envResolved.callCount, 2);
    assert.deepEqual(envResolved.args[0][0], units[0].id);
    assert.deepEqual(envResolved.args[1][0], units[1].id);
  });
});

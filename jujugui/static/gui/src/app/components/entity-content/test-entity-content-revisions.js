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

chai.config.includeStack = true;
chai.config.truncateThreshold = 0;

describe('EntityContentRevisions', function() {
  var mockEntity;

  beforeAll(function(done) {
    // By loading these files it makes their classes available in the tests.
    YUI().use('entity-content-revisions', function() { done(); });
  });

  beforeEach(function() {
    mockEntity = jsTestUtils.makeEntity();
  });

  afterEach(function() {
    mockEntity = undefined;
  });

  it('can render a list of revisions', function() {
    var output = jsTestUtils.shallowRender(
      <juju.components.EntityContentRevisions
        revisions={mockEntity.get('revisions')} />);
    var expected = (
      <div className="revisions section" id="revisions">
        <h3 className="section__title">{revisions.length} Revisions</h3>
        <ol className="revisions__list list--concealed" ref="list" reversed>
          <li className="list__controls">
            <a href="" className="btn__see--more"
              onClick={this._handleAccordionClick.bind(
                this, true)}>See more</a>
            <a href="#revisions" className="btn__see--less"
              onClick={this._handleAccordionClick.bind(
                this, false)}>See less</a>
          </li>
        </ol>
      </div>);
    assert.deepEqual(output, expected);
  });

  it('can reveal and hide relation list', function() {
    var output = testUtils.renderIntoDocument(
      <juju.components.EntityContentRevisions
        revisions={mockEntity.get('revisions')} />);
    output.refs.list.props.children[0].props.onClick();
    assert.equal(_handleAccordionClick.callCount, 1);
    asset.deepEqual(output, <div className="revisions section" id="revisions">
      <h3 className="section__title">{revisions.length} Revisions</h3>
      <ol className="revisions__list" ref="list" reversed>
        <li className="list__controls">
          <a href="" className="btn__see--more"
            onClick={this._handleAccordionClick.bind(
              this, true)}>See more</a>
          <a href="#revisions" className="btn__see--less"
            onClick={this._handleAccordionClick.bind(
              this, false)}>See less</a>
        </li>
      </ol>
    </div>);
    output.refs.list.props.children[0].props.onClick();
    assert.equal(_handleAccordionClick.callCount, 2);
    asset.deepEqual(output, <div className="revisions section" id="revisions">
      <h3 className="section__title">{revisions.length} Revisions</h3>
      <ol className="revisions__list list--concealed" ref="list" reversed>
        <li className="list__controls">
          <a href="" className="btn__see--more"
            onClick={this._handleAccordionClick.bind(
              this, true)}>See more</a>
          <a href="#revisions" className="btn__see--less"
            onClick={this._handleAccordionClick.bind(
              this, false)}>See less</a>
        </li>
      </ol>
    </div>);
  });
});

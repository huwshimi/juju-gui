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

YUI.add('entity-content-revisions', function() {

  juju.components.EntityContentRevisions = React.createClass({
    /* Define and validate the properites available on this component. */
    propTypes: {
      revisions: React.PropTypes.object.isRequired
    },

    /**
      Handle clicks on accordion. Toggles the concealed class on the list node
      which hides all the list items apart from the first.

      @method _handleAccordionClick
    */
    _handleAccordionClick: function(show) {
      var list = ReactDOM.findDOMNode(this).querySelector('.revisions__list');
      list.classList.toggle('list--concealed');
    },

    /**
      Generate the list of revisions.

      @method _generateRevisions
      @return {Object} The revisions markup.
    */
    _generateRevisions: function() {
      var components = [];
      var revisions = this.props.revisions;
      revisions.forEach(function(revision) {
        var date = new Date(Date.parse(revision.date));
        date = date.getFullYear() + '-' +
          ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
          ('0' + (date.getDay() + 1)).slice(-2);
        components.push(
          <li className="revisions__list-item list-item">
            <p className="revisions__list-meta smaller">
              by {revision.authors[0].name}
              <span className="revisions__list-meta-date">
                {date}
              </span>
            </p>
            <p className="revisions__list-message">
              {revision.message}
            </p>
          </li>
        );
      }, this);
      return components;
    },

    render: function() {
      var revisions = this.props.revisions;
      return (
        <div className="revisions section" id="revisions">
          <h3 className="section__title">{revisions.length} Revisions</h3>
          <ol className="revisions__list list--concealed" ref="list" reversed>
            {this._generateRevisions()}
            <li className="list__controls">
              <a href="" className="btn__see--more"
                onClick={this._handleAccordionClick.bind(
                  this, true)}>See more</a>
              <a href="#revisions" className="btn__see--less"
                onClick={this._handleAccordionClick.bind(
                  this, false)}>See less</a>
            </li>
          </ol>
        </div>
      );
    }
  });

}, '0.1.0', {requires: []});

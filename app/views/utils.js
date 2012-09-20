'use strict';

YUI.add('juju-view-utils', function(Y) {

var views = Y.namespace('juju.views');

var timestrings = {
    prefixAgo: null,
    prefixFromNow: null,
    suffixAgo: 'ago',
    suffixFromNow: 'from now',
    seconds: 'less than a minute',
    minute: 'about a minute',
    minutes: '%d minutes',
    hour: 'about an hour',
    hours: 'about %d hours',
    day: 'a day',
    days: '%d days',
    month: 'about a month',
    months: '%d months',
    year: 'about a year',
    years: '%d years',
    wordSeparator: ' ',
    numbers: []
};

/*
 * Ported from https://github.com/rmm5t/jquery-timeago.git to YUI
 * w/o the watch/refresh code
 */
var humanizeTimestamp = function(t) {
    var l = timestrings,
        prefix = l.prefixAgo,
        suffix = l.suffixAgo,
        distanceMillis = Y.Lang.now() - t,
        seconds = Math.abs(distanceMillis) / 1000,
        minutes = seconds / 60,
        hours = minutes / 60,
        days = hours / 24,
        years = days / 365;

    function substitute(stringOrFunction, number) {
        var string = Y.Lang.isFunction(stringOrFunction) ? 
            stringOrFunction(number, distanceMillis) : stringOrFunction,
            value = (l.numbers && l.numbers[number]) || number;
        return string.replace(/%d/i, value);
      }

    var words = seconds < 45 && substitute(l.seconds, Math.round(seconds)) ||
        seconds < 90 && substitute(l.minute, 1) ||
        minutes < 45 && substitute(l.minutes, Math.round(minutes)) ||
        minutes < 90 && substitute(l.hour, 1) ||
        hours < 24 && substitute(l.hours, Math.round(hours)) ||
        hours < 42 && substitute(l.day, 1) ||
        days < 30 && substitute(l.days, Math.round(days)) ||
        days < 45 && substitute(l.month, 1) ||
        days < 365 && substitute(l.months, Math.round(days / 30)) ||
        years < 1.5 && substitute(l.year, 1) ||
        substitute(l.years, Math.round(years));

      return Y.Lang.trim([prefix, words, suffix].join(' '));
};
views.humanizeTimestamp = humanizeTimestamp;

Y.Handlebars.registerHelper('humanizeTime', function(text) {
    if (!text || text === undefined) {return '';}
    return new Y.Handlebars.SafeString(humanizeTimestamp(Number(text)));
});



var JujuBaseView = Y.Base.create('JujuBaseView', Y.Base, [], {

    bindModelView: function(model) {
        model = model || this.get('model');
        // If this view has a model, bubble model events to the view.
        if (model) {
            model.addTarget(this);
        }

        // If the model gets swapped out, reset targets accordingly.
        this.after('modelChange', function (ev) {
            if (ev.prevVal) ev.prevVal.removeTarget(this);
            if (ev.newVal) ev.newVal.addTarget(this);
        });

        // Re-render this view when the model changes.
        this.after('*:change', this.render, this);
    },

    renderable_charm: function(charm_name, db) {
        var charm = db.charms.getById(charm_name);
        if (charm) {
            return charm.getAttrs();
        }
        return null;
    },

    stateToStyle: function(state, current) {
        // todo also check relations
        var classes;
        switch (state) {
        case 'pending':
            classes = 'state-pending';
                break;
        case 'started':
                classes = 'state-started';
                break;
        case 'start_error':
            classes = 'state-error';
                break;
        case 'install_error':
            classes = 'state-error';
                break;
        default:
            Y.log('Unhandled agent state: ' + state, 'debug');
        }
        classes = current && classes + ' ' + current || classes;
        return classes;
    },

    humanizeNumber: function(n) {
        var units = [ [1000, 'K'],
                      [1000000, 'M'],
                      [1000000000, 'B']],
            result = n;

        Y.each(units, function(sizer) {
                var threshold = sizer[0],
                    unit = sizer[1];
                   if(n > threshold) {
                    result = (n / threshold);
                    if (n % threshold !== 0) {
                        result = result.toFixed(1);
                    }
                    result = result + unit;
                }
        });
        return result;
    },

    addSVGClass: function(selector, class_name) {
        if (typeof(selector) == 'string') {
            Y.all(selector).each(function(n) {
                var classes = this.getAttribute('class');
                this.setAttribute('class', classes + ' ' + class_name);
            });
        } else {
            var classes = selector.getAttribute('class');
            selector.setAttribute('class', classes + ' ' + class_name);
        }
    },

    removeSVGClass: function(selector, class_name) {
        if (typeof(selector) == 'string') {
            Y.all(selector).each(function() {
                var classes = this.getAttribute('class');
                this.setAttribute('class', classes.replace(class_name, ''));
            });
        } else {
            var classes = selector.getAttribute('class');
            selector.setAttribute('class', classes.replace(class_name, ''));
        }
    }


});

views.JujuBaseView = JujuBaseView;

views.createModalPanel = function(body_content, render_target, action_label, action_cb) {
    var panel = new Y.Panel({
        bodyContent: body_content,
        width: 400,
        zIndex: 5,
        centered: true,
        show: false,
        classNames: 'modal',
        modal: true,
        render: render_target,
        buttons: [
            {
                value  : action_label,
                section: Y.WidgetStdMod.FOOTER,
                action : action_cb,
                classNames: ['btn-danger', 'btn']
            },
            {
                value  : 'Cancel',
                section: Y.WidgetStdMod.FOOTER,
                action : function (e) {
                    e.preventDefault();
                    panel.hide();
                },
                classNames: ['btn']
            }
        ]
    });
    // The default YUI CSS conflicts with the CSS effect we want.
    panel.get('boundingBox').all('.yui3-button').removeClass('yui3-button');
    return panel;
};

}, '0.1.0', {
    requires: ['base-build',
               'handlebars',
               'node',
               'view',
               'panel',
               'json-stringify']
});

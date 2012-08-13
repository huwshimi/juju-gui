YUI.add("juju-gui", function(Y) {

// Debug console access to YUI context.
yui = Y;

var models = Y.namespace("juju.models");

JujuGUI = Y.Base.create("juju-gui", Y.App, [], {
    views: {
        overview: {
            type: "juju.views.overview",
            preserve: false
        },

        service: {
            type: "juju.views.service",
            preserve: false,
            parent: "overview"
        },

	charm_search: {
            type: "juju.views.charm_search",
            preserve: true
	}
    },

    initializer: function () {
        var self = this,
            service_list = new models.ServiceList(),
            machine_list = new models.MachineList(),
            charm_list = new models.CharmList(),
            relation_list = new models.RelationList(),
            unit_list = new models.ServiceUnitList();
        
        this.domain_models = {
            services: service_list,
            machines: machine_list,
            charms: charm_list,
            relations: relation_list,
            units: unit_list
        };

        this.get_sample_data();

        this.on("*:showService", this.navigate_to_service);

	// Define custom events
	this.publish("env:msg", {
            emitFacade: true, defaultFn: this.message_to_event
	});
	this.publish("env:connect", {emitFacade: true});
	this.publish("env:disconnect", {emitFacade: true});


	// Update with status
	this.on('env:status', this.on_status_changed);

        this.once('ready', function (e) {
            var socket_url = this.get("socket_url");
            if (socket_url) {
                this.ws = new Y.ReconnectingWebSocket(socket_url);
	        this.ws.onmessage = Y.bind(this.on_message, this);
	        this.ws.onopen = Y.bind(this.on_open, this);
                this.ws.onclose = Y.bind(this.on_close, this);
	        console.log("websocket made");
            }

            if (this.hasRoute(this.getPath())) {
                this.dispatch();
            } else {
                this.show_overview();
            }
        }, this);

    },

    on_open: function(data) {
	console.log("open", data);
	this.fire('env:connect');
    },

    on_close: function(data) {
	console.log("close", data);
	this.fire('env:disconnect')
    },

    on_message: function(evt) {
	last_msg = evt;
	var msg = Y.JSON.parse(evt.data);
	console.log("msg", msg);
	if (msg.version === 0) {
	    console.log("greeting");
	    // call out to status
	    // this.env_status()
	    return;
	}
	this.fire("env:msg", msg);
    },

    message_to_event: function(evt) {
	console.log('msg2evt invoked')
	console.log('msg data', evt);
        var event_kind = {
            status: "env:status",
	    deploy: "env:deploy",
	    add_unit: "env:add_unit",
	    add_relation: "env:add_relation",
	    destroy_service: "env:destroy_service"
        }[evt.op];
        this.fire(event_kind, {
            data: evt
        });
    },
        
    // env methods
    env_status: function() {
	console.log("invoke env.status");
	this.ws.send(Y.JSON.stringify({'op': 'status'}));
    },

    add_unit: function(charm_url) {
	console.log("invoke env.deploy", charm_url);
	this.ws.send(
	    Y.JSON.stringify({'op': 'add_unit', 'charm_url': charm_url}));
    },

    add_relation: function(endpoint_a, endpoint_b) {
	//console.log("invoke env.deploy", charm_url);
	this.ws.send(
	    Y.JSON.stringify(
		{'op': 'add_relation', 
		 'endpoint_a': endpoint_a,
		 'endpoint_b': endpoint_b}));
    },

    deploy: function(charm_url) {
	console.log("invoke env.deploy", charm_url);
	this.ws.send(
	    Y.JSON.stringify({'op': 'deploy', 'charm_url': charm_url}));
    },
    // end env methods

    on_status_changed: function(evt) {
	console.log('status changed', evt);
	this.parse_status(evt.data.result);
        this.showView('overview', {domain_models: this.domain_models});
    },

    get_sample_data: function() {
        var self = this;
        Y.io("status.json", {
                 context: this, 
                 on: {
                     complete: function(id, response) {
                         var status = Y.JSON.parse(response.responseText);
                         this.status = this.parse_status(status);
                     }}
             });

    },
        
    parse_status: function(status_json) {
	console.log("parse status");
        var d = this.domain_models,
            relations = {};

        // for now we reset the lists rather than sync/update
        d.services.reset();
        d.machines.reset();
        d.charms.reset();
        d.relations.reset();
        d.units.reset();

        Y.each(status_json.machines, 
            function(machine_data, machine_name) {
            var machine = new models.Machine({
                machine_id: machine_name,
                public_address: machine_data["dns-name"]});
            d.machines.add(machine);
        }, this);
	
        
        Y.each(status_json.services, 
            function(service_data, service_name) {
		var charm = new models.Charm({
                        charm_id: service_data.charm});
		var service = new models.Service({
                    name: service_name,
                    charm: charm
		});
		d.services.add(service);
		d.charms.add(charm);
                
                Y.each(service_data.units, function(unit_data, unit_name) {
                    var unit = new models.ServiceUnit({
                            name: unit_name,
                            service: service,
                            machine: d.machines.getById(unit_data.machine),
                            agent_state: unit_data["agent-state"],
                            is_subordinate: (service_data.subordinate || false),
                            public_address: unit_data["public-address"]
                            });
                    d.units.add(unit);
                }, this);

                Y.each(service_data.relations,
                    function(relation_data, relation_name) {
                        // XXX: only preocessing 1st element for now
                        relations[service_name] = relation_data[0];
                        // XXX: fixiing this will alter the build
                        // in the relations block below
                }, this);

            }, this);

        Y.each(relations, function(source, target) {
                   var s = d.services.getById(source);
                   var t = d.services.getById(target);
                   var relation = new models.Relation({
                           endpoints: {source: s, target: t}
                           });
                   d.relations.add(relation);
               });

    },
        
    // Event handlers
    navigate_to_service: function(e) {
        var service = e.service;
        this.navigate("/service/" + service.get("id") + "/");
    },

    // Route handlers
    show_service: function(req) {
        var d = this.domain_models, 
            service = d.services.getById(req.params.id);
        this.showView("service", {
                          service: service,
                          domain_models: this.domain_models
                      });


    },

    show_overview: function (req) {
	console.log('show overview');
        this.showView('overview', {domain_models: this.domain_models});
    },

    show_charm_search: function(req, res, next) {
	console.log('show search');
	var charm_search = this.get('charm_search');
	if (!charm_search) {
	    console.log('creating search');
	    charm_search = this.createView(
		'charm_search', {'app': this});
	    this.set('charm_search', charm_search.render());
	}
	next();
    }

}, {
    ATTRS: {
        routes: {
            value: [
		{path: "*", callback: 'show_charm_search'},
                {path: "/", callback: 'show_overview'},
                {path: "/service/:id/", callback: 'show_service'}
                ]
            }
    }
});

Y.namespace("juju").App = JujuGUI;

}, "0.5.2", {
       requires: [
       "io",
       "json-parse",
       "juju-models",
       "juju-views",
       'app-base',
       'app-transitions',
       'base',
       'node',
       "reconnecting-websocket"
       ]
});
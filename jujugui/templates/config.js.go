var juju_config = {
    "baseUrl": "{{.base}}",
    "staticURL": "{{.staticURL}}",
    "jujuCoreVersion": "{{.version}}",
    "jujuEnvUUID": "{{.uuid}}",
    "apiAddress": "wss://{{.host}}",
    "socketTemplate": "{{.socket}}",
    "socket_protocol": "wss",
    "charmstoreAPIPath": "v4",
    "charmstoreURL": "https://api.jujucharms.com/charmstore/",
    "interactiveLogin": true,
    "html5": true,
    "container": "#main",
    "viewContainer": "#main",
    "consoleEnabled": true,
    "serverRouting": false,
};

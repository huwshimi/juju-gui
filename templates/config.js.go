var juju_config = {
    "baseUrl": "{{.base}}",
    "staticURL": "{{.staticURL}}/static",
    "jujuCoreVersion": "{{.version}}",
    "jujuEnvUUID": "{{.uuid}}",
    "apiAddress": "wss://{{.host}}",
    "controllerSocketTemplate": "{{.controllerSocket}}",
    "socketTemplate": "{{.socket}}",
    "bakeryEnabled": {{or (.bakeryEnabled) "true"}},
    "socket_protocol": "wss",
    "charmstoreAPIPath": "v4",
    "charmstoreURL": "https://api.jujucharms.com/charmstore/",
    "bundleServiceURL": "https://api.jujucharms.com/bundleservice/",
    "plansURL": "https://api.jujucharms.com/omnibus/",
    "paymentURL": "https://api.jujucharms.com/payment/",
    "ratesURL": "https://api.jujucharms.com/rates/",
    "termsURL": "https://api.jujucharms.com/terms/",
    "interactiveLogin": true,
    "html5": true,
    "container": "#main",
    "viewContainer": "#main",
    "consoleEnabled": true,
    "serverRouting": false,
};

var net = require('net');

var net_options = {
	 timeout  : 0
	,encoding : 'utf8'
}

var setupListeners = function (client) {
		var log = client.logger;
		log(1,'connected');
		var events = require('./IRCListeners.js').GetListeners(client);
		for (var eventname in events) {
			var eventlistener = events[eventname];
			client.connection.addListener(eventname, eventlistener);
		}
	}

var net_config = function(net_conn) {
	net_conn.setTimeout(net_options.timeout);
	net_conn.setEncoding(net_options.encoding);
}

var create_new_conn = function(cb) {
	var client = this;
	for (var i in client.options) net_options[i] = client.options[i];
	var conn = client.connection = net.connect(net_options,function(connection) {
		setupListeners(client);
		client.connection = conn;
		if (cb) cb(conn);
	});
}

module.exports.create = create_new_conn;
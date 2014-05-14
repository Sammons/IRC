var net = require('net');

var net_options = {};
var net_config = function(net_conn) {
	net_conn.setTimeout(net_options.timeout);
	net_conn.setEncoding(net_options.encoding);
}

var create_new_conn = function(client,cb) {
	for (var i in client.options) net_options[i] = client.options[i];
	var conn = net.connect(net_options,function(connection) {
		if (cb) cb(conn);
	});
}

module.exports.connect = create_new_conn;
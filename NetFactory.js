var net = require('net');

var net_options = {
	 requestDisconnect : false
	,timeout           : 0
	,encoding          : 'utf8'
}

var net_config = function(net_conn) {
	net_conn.requestDisconnect 
		= net_options.requestDisconnect;
	net_conn.setTimeout(net_options.timeout);
	net_conn.setEncoding(net_options.encoding);
}

var create_new_conn = function(options,cb) {
	for (var i in options) net_options[i] = options[i];
	var conn = net.connect(net_options,function() {
		net_config(conn);
		if (cb) cb(conn);
	});
	return conn;
}

module.exports.create = create_new_conn;
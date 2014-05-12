exports.inject = function(client) {
	var log = client.logger;
	var options = client.options;
	client.openTLSConn = require('./TLSFactory.js').create;
	client.openNetConn = require('./NetFactory.js').create;

	client.connect = function() {
		if (client.options.secure) {
			log(1, "connecting using tls");
			client.openTLSConn();
		} else {
			log(1, "connecting using net");
			client.openNetConn();
		}
	}

	var parse = require('./IRCMessageParser.js').parse;
	client.recieveRawMessage = function(raw_message) { // {{{
		var messageObj = parse(raw_message);
		log(0,"parsed message",messageObj)
	}
}
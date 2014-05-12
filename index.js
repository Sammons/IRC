var util = require('util');

var Client = function(custom_options) {
	var client = this;
	//get irc-options with custom options overriding
	var options = 
		require('./IRCOptions.js').GetOptions(custom_options);

	var log = this.logger = 
		require('./Logger.js').GetLogger(options);
	
	function setupListeners(connection) {
		log(1,'connected');
		var events = require('./IRCListeners.js').GetListeners(client);
		for (var eventname in events) {
			var eventlistener = events[eventname];
			connection.addListener(eventname, eventlistener);
		}
	}

	// if secure flag triggered then use tls
	// note that tls requires a cert
	var connection = client.connection = 
		(options.secure 
		? log(0,'connecting with tls') 
			|| require('./TLSFactory.js')
				.create(options,setupListeners)
		: log(0,'connecting with net') 
			|| require('./NetFactory.js')
				.create(options,setupListeners)
		)
}

exports.client = Client;
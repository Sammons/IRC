var Client = function(custom_options,callback) {
	var client = this;

	//get irc-options with custom options overriding
	var options = client.options = require('./IRCOptions.js').GetOptions(custom_options);
	var log = client.logger = require('./Logger.js').GetLogger(options);
	
	// attach actions an IRC client needs to perform
	// such as connecting, or recieving a message
	require('./IRCActions.js').inject(client);
	
	// as seen in the IRCActions
	// uses the net or tls factory to create a connection
	// based on the options
	// and then sends ident info and whatnot
	// will retry on failure
	client.connect();

	if (callback) callback(client);
	return client;
}

exports.client = Client;
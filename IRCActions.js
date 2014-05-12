exports.inject = function(client) {
	var log = client.logger;
	var options = client.options;
	client.openTLSConn = require('./TLSFactory.js').create;
	client.openNetConn = require('./NetFactory.js').create;

	client.issueCommand = function(command) {
		var param_str = ''
		var keyCount = Object.keys(arguments).length;
		for (var i=1; i < keyCount; i++) {
			param_str += arguments[i]+' ';
		}
		var msg = command+' '+param_str+'\r\n';
		client.connection.write(msg);
		log(0,"sent msg:"+msg);
	}

	client.trigger = function() {};

	client.connect = function() {
		if (client.options.secure) {
			log(1, "connecting using tls");
			client.openTLSConn();
		} else {
			log(1, "connecting using net");
			client.openNetConn();
		}
		log(0, "attempting to tell server who I am");
		client.issueCommand('NICK',options.nick,"");
		client.issueCommand('USER',options.nick,8,'*',options.user)
		client.issueCommand('JOIN','#mizzouacm')
		setTimeout(function() {
					client.issueCommand('PRIVMSG','#mizzouacm',":what's up?");
				},10000)

	}
	
	client.parse = require('./IRCMessageParser.js').parse;
	client.recieveRawMessage = function(raw_message) { // {{{

		var messageObj = client.parse(raw_message);
	}
}
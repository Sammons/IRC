exports.inject = function(client) {
	var log = client.logger;
	var options = client.options;
	var commands = client.commands;

	client.openTLSConn = require('./TLSFactory.js').create;
	client.openNetConn = require('./NetFactory.js').create;

	client.write = function() {
		//grab first arg (command)
		var text = arguments[0]+'';

		//then grab all but the first arg and add them with spaces
		arguments[0] = '';
		for (var i in arguments) text += ' ' + arguments[i];

		//convenience add \r\n if it has been forgotten
		if (text.indexOf('\r\n')<0) text = text+'\r\n';

		//pew pew
		client.connection.send(text);
		log(0,"sent msg:"+text.replace('\r\n',''));
	}
	
	client.issueCommand = function(command) {
		var cmd = commands[command];
		if (!cmd) throw('unsupported command!');
		cmd.send.apply(
			  client
			, Array.prototype.slice.call(arguments, 1)
			);
	}

	client.trigger = function() {};

	var identify = function(onReady) {
		// log(0, "attempting to tell server who I am");
		client.issueCommand("NICK")
		client.issueCommand("USER")
		client.write('JOIN','#mizzouacm')
		client.issueCommand("PRIVMSG","#mizzouacm","helloworld")
	}

	client.connect = function(onReady) {
		if (client.options.secure) {
			log(1, "connecting using tls");
			client.openTLSConn(function() {identify(onReady)});
		} else {
			log(1, "connecting using net");
			client.openNetConn(function() {identify(onReady)});
		}
	}
	client.close = function(onclose) {
		client.issueCommand("PRIVMSG", "#mizzouacm", "goodbye");
		client.connection.destroy();
	}
	process.on('SIGINT',function(){
		client.close();
		process.kill();
	});

	client.parse = require('./IRCMessageParser.js').parse;
	client.recieveRawMessage = function(raw_message) {
		var messageObj = client.parse(raw_message);
	}
}
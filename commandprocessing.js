var listen = function(client) {
	client.on("data",function(message){
		 console.log(message)
		var msgObj = {};
		
		// this regex should pull the prefix out if there is one...
		// but there might not be one
		var prefix = message.match(/^(:.*?) .*\r?\n?/)[1];
		if (prefix.indexOf(':') != 0) {
			//no prefix
			prefix = null;
		} else {
			//prefix: servername | ( nickname [ [ "!" user ] "@" host ] )
			var p = {};

			if (prefix.indexOf('@') >= 0) {
				//there is a nick and a host
				p.host = prefix.substring(prefix.lastIndexOf('@')+1);
				if (prefix.indexOf('!') >= 0) {
					//there is a user
					p.user = prefix.substring(prefix.indexOf('!')+1, prefix.lastIndexOf('@'));
					p.nickname = prefix.substring(1,prefix.indexOf('!'));
				} else {
					//there is no user
					p.nickname = prefix.substring(1,prefix.indexOf('@'));
				}
			} else {
				p.host = prefix.substring(1);
				//just a servername
			}
			prefix = p;
		}
		// now we check for the command, regardless of prefix existing
		var command = message.replace(prefix,'').trim().match(/^(.*?) .*/)[1];

		// var tokens = message.split(/\s/g);
		// //the next part could get gross =)
		// if (tokens[1] == "PRIVMSG") client.trigger("privmsg",message,tokens);
		// if (tokens[0] == "PING") client.trigger("pong",message,tokens)

	})
	client.on("privmsg",function(message,tokens){
		var msg = {
			 from: message.substring(1,message.indexOf('!')).trim()
			,to:   tokens[2].trim()
			,what: message.match(/\s:.*$/g)[0].trim()
			,when: Date.now()
			}
			client.trigger("message",msg);
	})
	client.on("message",function(msg) {
		
	})
	client.on("pong",function(msg,tokens) {
		client.write("PONG",tokens[1]);
	})
}

module.exports.listen = listen
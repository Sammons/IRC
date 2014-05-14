var listen = function(client) {
	client.on("data",function(message){
		console.log(message)
		var tokens = message.split(/\s/g);
		//the next part could get gross =)
		if (tokens[1] == "PRIVMSG") client.trigger("privmsg",message,tokens);
		if (tokens[0] == "PING") client.trigger("pong",message,tokens)
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
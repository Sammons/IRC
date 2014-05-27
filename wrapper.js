module.exports.attachMethodsTo = function(client) {

		/**********trying to wrap the JOIN command*
		IRC does not specify that the server HAS to respond to a JOIN command
		with a success/fail, and generally servers do whatever they want. This
		client has been tested with freenode, so the logic here watches for
		freenode's typical observed behavior for a JOIN command.

		the 366 command is an end of names command. Freenode sends a name list when
		you join a channel, so we can say that if they send us a 366 with the channel
		we asked to join, then we have in fact joined it - there are countless other ways
		to verify this, but try to stick to methods which won't be false positives
		*/
		client.on("data",function(chunk){
			var t = chunk.split(/\s/g)
			if (t[1].trim()=="366")
				client.trigger("366"+t[3]);
		})
		this.join = function(channel,key, cb) {
			if (typeof(key) == "function") {cb = key; key = null}
			client.write("JOIN",channel, key || '');
			var listening = true;
			client.on("366"+channel, function() {
				if (listening) cb(true)
				listening = false;
			})
			setTimeout(function() {
				if (listening) {
					listening = false;
					cb(false);
				}
			},10000)
		}

		/**********trying to wrap identification*
		This is a particularly interesting process with IRC, since there are multiple ways
		to go about it.
		We don't have to have a PASS, but we could. We don't necessarily always need the USER
		command, but sometimes we do. It is difficult to establish the exact way freenode requires
		a client to behave, but this function tries to wrap a very highly successful functionality.
		*/
		var identify = function() {
			client.write("PASS",client.options.pass || "");
			client.write("USER"
				,client.options.nick
				,client.options.usermode
				,"*"
				,":"+client.options.realname);
			client.write("NICK",client.options.nick);
			client.join(client.options.channels[0],function (confirmed) {
				console.log("succesfully joined?:"+confirmed);
			})
		};
	// client.prototype.send = function() {}
	// client.prototype.join = function() {}
	// client.prototype.leave = function() {}
	// client.prototype.close = function() {}

	// client.prototype.pm = function() {}
	// client.prototype.whois = function() {}
	// client.prototype.kick = function() {}
	// client.prototype.ignore = function() {}

}
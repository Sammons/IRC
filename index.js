var net = require('net');

var Client = function(custom_options, callback) {
	var client = this;
	this.options = {
		 timeout  : 0
		,encoding : 'utf8'
		,host     : ''
		,nick     : ''
		,realname : ''
		,channels : []
		,usermode : 8 // invisible to channels not joined
		,port 	  : 6667 
		,secure   : false
		,pass     : ''
		,message_timeout : 10000
		,command_interval : 700//good for freenode usually
	};
	upsert(this.options, custom_options);

	/*sanity checks*/
	if (client.options.host == '') console.log('No server specified, please use a host: "somethinghere" option');
	if (client.options.nick == '') console.log('No nickname, please use a nick: "nicknamehere" option');

	/*
	The trigger/on system
	*/
	var triggers = {};
	var oncetriggers = {};
	var conditionally_once_triggers = {};
	var trigger = this.trigger = function(what, args) {
		for (var i in triggers[what]) 
			triggers[what][i].apply(this,
				Array.prototype.slice.call(arguments, 1));
		for (var i in oncetriggers[what])
			oncetriggers[what][i].apply(this,
				Array.prototype.slice.call(arguments, 1));
		for (var i in conditionally_once_triggers[what]){
			var bool = conditionally_once_triggers[what][i].apply(this,
				Array.prototype.slice.call(arguments, 1));
			if (bool) conditionally_once_triggers[what].splice(i);
		}
		oncetriggers[what] = [];
	}
	var on = this.on = function(what, callback) {
		initpush(triggers, what, callback);
	}
	var once = this.once = function(what, callback) {
		initpush(oncetriggers, what, callback);
	}
	var conditionally_once = this.conditionally_once = function(what, callback) {
		initpush(conditionally_once_triggers, what, callback)
	}
	var unbind = this.unbind = function(what, func) {
		triggers[what] = removeFromArray(triggers[what], func);
	}

	/*
	Open & Close methods
	the rest of the client functionality is
	wrapped into the wrapper.js file
	*/
	var open = this.open = function() {
		try {
			var conn = net.connect(this.options.port, this.options.host, function(){
				conn.setTimeout(0)
				conn.setEncoding(client.options.encoding)
				conn.addListener("connect",function () {trigger("connect")})
				conn.addListener("end",function () {
					console.log('closed socket?')
					conn.destroy();
					open();
					trigger("end")
				})

				var socketBuffer = '';
				conn.addListener("data",function (chunk) {
					socketBuffer += chunk;
					var messages = socketBuffer.split('\r\n');
					socketBuffer = messages.pop();
					for(var i in messages) trigger("data",messages[i]);
				})
				conn.addListener("error",function (e) {trigger("error",e)})
				client.conn = conn;
				client.write = function() {
					var str = '';
					for (var i in arguments) str += arguments[i]+' ';
					if (str.indexOf("\r\n")<0) str+="\r\n";
					client.conn.write(str,client.options.encoding);
				}
				setTimeout(function() {
						client.write("PASS"
							,client.options.pass
							);
						client.write("USER"
							,client.options.nick
							,client.options.usermode
							,"*"
							,client.options.realname 
							|| client.options.nick
							);
						client.write("NICK"
							,client.options.nick
							);
						client.write("JOIN"
							,client.options.channels.join(',')
							);
					}, 1000);
				process.once("SIGINT",function(){
					client.trigger("quit");
					client.write("JOIN 0");//leave all channels
					client.write("QUIT");
					conn.destroy();
					console.log(" ctrl+C one more time to end");
					process.emit("SIGINT");
				})
			});
		} catch(e) {
			console.log(e);
		}
	}

// this is the set of commands which the client has been programmed to 
// respond to, they by no means cover everything
	client.on("data",function(message){
		var msgObj = {};
		
		// this regex should pull the prefix out if there is one...
		// but there might not be one
		var prefix = message.match(/^((:.*?) )?(.*)\r?\n?/);
		prefix = prefix[1] || prefix[0];// a few messages are just a command
		if (prefix.indexOf(':') != 0) {
			//no prefix
			prefix = {raw: "", user: "", nickname: "", host: ""};
		} else {
			//prefix: servername | ( nickname [ [ "!" user ] "@" host ] )
			var p = {};
			p.raw = prefix;
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
		var command = message.replace(prefix.raw,'').trim().match(/^(.*?) .*/)[1];
		msgObj.prefix = prefix;
		msgObj.command = command;
		console.log(command)
		msgObj.raw = message;
		// arguments are complicated, so we leave that for later
		// console.log(msgObj.command)
		client.trigger(command, msgObj);
		client.trigger("any",msgObj);
	})

	client.on("PING",function(msgObj) {
		console.log("PONG",msgObj.raw.split(' ')[1]);
		client.write("PONG",msgObj.raw.split(' ')[1]);
	});

	if (callback) callback(client);
}

module.exports = Client;

/******************************/
	//helpers//
/******************************/

function upsert(origA, newA) {for (var i in newA) origA[i] = newA[i];}
function initpush(obj, key, elem) {
	if (!obj[key]) obj[key] = [];
	obj[key].push(elem);
}
function removeFromArray(array, el) {
	var index = array.indexOf(el);
	if (index < 0) return;
	array.splice(index, 1);
}


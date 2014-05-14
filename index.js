var net = require('net');

var client = function(custom_options) {
	var client = this;
	this.options = {
		 timeout  : 0
		,encoding : 'utf8'
		,host     : 'chat.freenode.org'
		,nick     : 'buttertesting'
		,realname : "Ben Sammons"
		,channels : ['##benlife']
		,greeting : "Hello guys"
		,goodbye  : "Farewell"
		,usermode : 8 // invisible to channels not joined
		,port 	  : 6667 
		,secure   : false
		,pass     : "loading"
		,debug    : 1
		,message_timeout : 10000
		,command_interval : 700//good for freenode usually
	};
	upsert(this.options, custom_options);
	var out = [];
	var input = [];

	var triggers = {};
	var trigger = this.trigger = function(what, args) {
		for (var i in triggers[what]) 
			triggers[what][i].apply(this,
				Array.prototype.slice.call(arguments, 1));
	}
	var on = this.on = function(what, callback) {
		initpush(triggers, what, callback)
	}

	var unbind = this.unbind = function(what, func) {
		triggers[what] = removeFromArray(triggers[what], func);
	}
	var open = this.open = function() {
		var network = require('./'+(this.options.secure ? "TLS" : "Net") + "Factory.js");
		var conn = net.connect(this.options.port, this.options.host, function(){
			conn.setTimeout(0)
			conn.setEncoding(client.options.encoding)
			conn.addListener("connect",function () {trigger("connect")})
			conn.addListener("end",function () {trigger("end")})

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
				console.log('sent::- '+str.replace(/\r|\n/g,''));
				client.conn.write(str,client.options.encoding);
			}
			setTimeout(function() {identify()}, 1000);
		});
	}

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

	//send user + nick
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
	require('./commandprocessing.js').listen(client);
}
// client.prototype.send = function() {}
// client.prototype.join = function() {}
// client.prototype.leave = function() {}
// client.prototype.close = function() {}

// client.prototype.pm = function() {}
// client.prototype.whois = function() {}
// client.prototype.kick = function() {}
// client.prototype.ignore = function() {}

module.exports.client = client;

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


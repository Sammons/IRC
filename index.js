var net = require('net');

var Client = function(custom_options) {
	var client = this;
	this.options = {
		 timeout  : 0
		,encoding : 'utf8'
		,host     : ''
		,nick     : ''
		,realname : ''
		,channels : []
		,greeting : ''
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

	/*
	The trigger/on system
	*/
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

	/*
	Open & Close methods
	the rest of the client functionality is
	wrapped into the wrapper.js file
	*/
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
			setTimeout(function() {
						client.write("USER","butterbot","8","*","Ben Sammons");
		client.write("NICK","butterbot");client.trigger("socketconnected")}, 1000);
		});
	}
// this is the set of commands which the client has been programmed to 
// respond to, they by no means cover everything
require('./commandprocessing.js').listen(client);

// this is the set of commands with which a person unfamiliar with IRC can interact
// to control the client
require('./wrapper.js').attachMethodsTo(client);
}



module.exports.client = Client;

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


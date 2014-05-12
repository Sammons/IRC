var tls = require('tls');
var net = require('net');
var util = require('util');


var Options = function(custom_options) {
	var o = this;
	//default options
	o.host   = 'chat.freenode.org';
	o.port 	 = 6667
	o.secure = false
	o.debug  = true
	//apply custom options
	for (var i in custom_options) 
		o[i] = custom_options[i];
}

var options = new Options()

function log() {
	if (options.debug) util.log.apply(this,arguments);
}

function on_connect() {
	log('connected');
}


// if secure flag triggered then use tls
// note that tls requires a cert
var connection = (
	  options.secure 
	? log('connecting with tls') || tls 
	: log('connecting with net') || net
	).connect(options,on_connect);



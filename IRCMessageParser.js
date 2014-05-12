var codes = require('./IRCCodes.js');

exports.parse = function(raw, strip_colors, cb) {
    var client = this;

    if (typeof(strip_colors) == "function") cb = strip_colors;
    else strip_colors = strip_colors || false;

    var msg = {};

    var color_regexp = /[\x02\x1f\x16\x0f]|\x03\d{0,2}(?:,\d{0,2})?/g
    if (strip_colors) {
        raw_message = raw_message.replace(color_regexp, "");
    }
    var tokens = raw.split(/\s/g);
    
    //sometimes there is no server in the command 
    if (codes[tokens[0]]) {
        msg.server  = tokens[1];
        msg.command = tokens[0];
    } else {
        msg.server  = tokens[0].trim();
        msg.command = tokens[1].trim();        
    }

    var commandObj = codes[msg.command];
    
    if (commandObj){
        tokens[0] = ''; tokens[1] = '';
        var rest_of_msg = tokens.join(' ');
        commandObj.messageObj = msg;
        commandObj.action(client,rest_of_msg);
        client.trigger(msg.command,raw);
        if (cb) cb();
    } else {
        console.log(msg);
        throw('unsupported command',msg);
    }
}

var alternate = function(raw_message, strip_colors, cb) {
	if (typeof(strip_colors) == "function") cb = strip_colors;
	else strip_colors = strip_colors || false;

	var message = {};

    //Credit due -- these regexps come from the node-irc module
    //
    var color_regexp = /[\x02\x1f\x16\x0f]|\x03\d{0,2}(?:,\d{0,2})?/g
    var prefix_parts_regexp = /^([_a-zA-Z0-9\[\]\\`^{}|-]*)(!([^@]+)@(.*))?$/
    var prefix_regexp = /^:([^ ]+) +/
    var command_regexp = /^([^ ]+) */
    var command_if_end_regexp = /^[^ ]+ +/
    var colon_regexp = /^:|\s+:/
    var param_regexp = /(.*?)(?:^:|\s+:)(.*)/

    if (strip_colors) {
        raw_message = raw_message.replace(color_regexp, "");
    }

    // Parse prefix_regexp
    if ( match = raw_message.match(prefix_regexp) ) {
        var prefix = match[1];
        raw_message = raw_message.replace(prefix_regexp, '');
        prefix_parts = prefix.match(prefix_parts_regexp)
        if (prefix_parts) {
            message.nick = prefix_parts[1];
            message.user = prefix_parts[3];
            message.host = prefix_parts[4];
        }
        else {
            message.server = prefix;
        }
    }

    var command_in_message = raw_message.match(command_regexp)[1].trim();
    console.log(command_in_message)
    raw_message = raw_message.replace(command_if_end_regexp, '');
    
    //lookup information correlated to this command
    //if not found then leave as is
    if (codes[command_in_message]) {
        message.command     = codes[command_in_message].name;
        message.commandType = codes[command_in_message].type;
        message.action      = codes[command_in_message].action;
    } else {
    	throw('unsupported command');
    }

    message.params = [];
    var middle, trailing;

    // Parse parameters - colon indicates their presence
    if ( raw_message.search(colon_regexp) != -1 ) {
        var params = raw_message.match(param_regexp);
        middle     = params[1].trimRight();
        trailing   = params[2];
    }
    else {
        middle = raw_message;//most of params (if not all)
    }

    if ( middle.length )
        message.params = middle.split(/ +/);//params space delimmited

    if ( typeof(trailing) != 'undefined' && trailing.length )
        message.params.push(trailing);//last param if exists

    if (cb) cb(message);
    return message;
}
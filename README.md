IRC
===

Usage, using Freenode

var irc_client = require('irc');

var client = new irc_client({
	host: "chat.freenode.net"
	nick: "some_unregistered_nick"
});

client.open();
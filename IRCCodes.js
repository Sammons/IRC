var start_motd = function(client,rest_of_msg) 
   {client.motd = '';}
   
var add_to_motd = function(client,rest_of_msg) 
   {client.motd += rest_of_msg
      .replace(client.options.nick,'')
      .replace(':-','').trim() +'\n'}

var end_motd = function(client,rest_of_msg) 
   {client.motd += '\n';console.log(client.motd)}

var notice  = function(client,rest_of_msg) 
   {client.logger(0, 'notice recieved=>'+rest_of_msg);}

var mode  = function(client,rest_of_msg) 
   {client.logger(0, 'modes recieved=>'+rest_of_msg);}

var non = function() {}
//let's do this
module.exports = {
   /*3.3.2 Notice

      Command: NOTICE
   Parameters: <msgtarget> <text>

   The NOTICE command is used similarly to PRIVMSG.  The difference
   between NOTICE and PRIVMSG is that automatic replies MUST NEVER be
   sent in response to a NOTICE message.  This rule applies to servers
   too - they MUST NOT send any error reply back to the client on
   receipt of a notice.  The object of this rule is to avoid loops
   between clients automatically sending something in response to
   something it received.

   This command is available to services as well as users.

   This is typically used by services, and automatons (clients with
   either an AI or other interactive program controlling their actions).

   See PRIVMSG for more details on replies and examples.*/
   "NOTICE": {
      "name" : "notice",
      "type" : "no_reply",
      "action": notice
   },
   "MODE": {
      "name" : "mode",
      "type" : "no_reply",
      "action": mode
   },
   "001": {
      "name":"RPL_WELCOME",
      "type":"no_reply",
      "action":non
   },
   "002": {
      "name":"RPL_YOURHOST",
      "type":"no_reply",
      "action":non
   },
   "003": {
      "name":"RPL_CREATED",
      "type":"no_reply",
      "action":non
   },
   "004": {
      "name":"RPL_MYINFO",
      "type":"no_reply",
      "action":non
   },
   "005": {
      "name":"RPL_ISUPPORT",
      "type":"no_reply",
      "action":non
   },
   "250": {
      "name":"RPL_STATSCONN",
      "type":"no_reply",
      "action":non
   },
   "251": {
      "name":"RPL_LUSERCLIENT",
      "type":"no_reply",
      "action":non
   },
   "252": {
      "name":"RPL_LUSEROP",
      "type":"no_reply",
      "action":non
   },
   "253": {
      "name":"RPL_LUSERUNKNOWN",
      "type":"no_reply",
      "action":non
   },
   "254": {
      "name":"RPL_LUSERCHANNELS",
      "type":"no_reply",
      "action":non
   },
   "255": {
      "name":"RPL_LUSERME",
      "type":"no_reply",
      "action":non
   },
   "265": {
      "name":"RPL_LOCALUSERS",
      "type":"no_reply",
      "action":non
   },
   "266": {
      "name":"RPL_GLOBALUSERS",
      "type":"no_reply",
      "action":non
   },
   "375": {
      "name":"RPL_MOTDSTART",
      "type":"no_reply",
      "action":start_motd
   },
   "372": {
      "name":"RPL_MOTD",
      "type":"no_reply",
      "action":add_to_motd
   },
   "376": {
      "name":"RPL_ENDOFMOTD",
      "type":"no_reply",
      "action":end_motd
   },
   "433": {
      "name":"ERR_NICKNAMEINUSE",
      "type":"no_reply",
      "action":non
   }
}; 

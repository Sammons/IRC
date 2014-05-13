var waiting = {};
var counter = 0;//make waiting messages unique

var start_motd = function(client,msg) 
   {client.motd = '';}

var add_to_motd = function(client,msg) 
   {client.motd += msg
      .replace(client.options.nick,'')
      .replace(':-','').trim() +'\n'}//clear freenode formatting

var end_motd = function(client,msg) 
   {client.motd += '\n';}

var notice  = function(client,msg) 
   {client.logger(1, 'NOTICE: '+msg);}

var mode  = function(client,msg) 
   {client.logger(0, 'modes recieved =>'+msg);}

var ping_recieved = function(client,msg) {
   client.issueCommand('PONG',this.tokens[1]);
   if (this.tokens.length > 2) {
      throw("SERVER FUNCTIONALITY NOT SUPPORTED");
   }
}

var prvmsg = function(client,msg){
   var from = this.tokens[0].replace(/\!.*|\:/g,'');
   var to   = this.tokens[2].trim();
   var what = msg.replace(/.*\s.*\s.*\s:/g,''); 
   client.logger(1,"MESSAGE from:"+from+" to:"+to+" -> "+what);
}
var register = function(client, msg) {

} 
var err_notregistered = function(client, msg) {
   client.issueCommand('NICK');
   client.issueCommand('USER');
}


var err_needmoreparams = function(client, msg) {
   for (var i in waiting) {
      if (waiting[i].server_responses.indexOf("ERR_NEEDMOREPARAMS") >= 0) {
         waiting[i].error(client,msg,"ERR_NEEDMOREPARAMS")
         return;
      }
   }
}

var rpl_yourhost = function(client, msg) {}

var err_erroneusnickname;
var err_nicknameinuse;
var err_alreadyregistered;

var non = function(client,msg) {
   client.logger(0,'MESSAGE: '+this.tokens[0]+'::'+this.name+'::'+msg)
}

/*********************END RECIEVE LISTENERS*********************************/
/*********************BEGIN SENDERS*****************************************/
var non_send = function() { client.logger(0,"UNSUPPORTED COMMAND");}

var nick = function() {
   var client = this;
   client.write("NICK",client.options.nick);
}
var pong = function() {
   var client = this;
   client.write("PONG",client.host);
}
var user = function() {
   var client = this;
   var o = client.options;
   
   //show that we are waiting
   counter++;
   var label = "USER-"+counter
   waiting[label] = commands.USER;
   //stop waiting for response
   setTimeout(function(){delete waiting[label]},o.message_timeout) 
   
   client.write(
      "USER"
      ,o.nick
      ,o.usermode
      ,o.user_unused||'*'
      ,':'+o.realname
      );
}


/*********************END SENDERS*******************************************/

/*********************BEGIN ERROR HANDLING**********************************/
var user_err = function(client, msg, error) {
   if (error == "ERR_NEEDMOREPARAMS") {
      client.logger(2,"Are you sure your ircconfig file is correct?\n"+
         "The client just recieved an error saying we are missing some inputs for a command\n"+
         "Parameters for command 'USER': <user> <mode> <unused> <realname>");
   } else {
      client.logger(0,"Oops, tried to register twice");
   }
}
/*********************END ERROR HANDLING************************************/

/*********************BEGIN CODE DEFINITIONS********************************/
//let's do this
//http://tools.ietf.org/html/rfc2812
//https://www.alien.net.au/irc/irc2numerics.html
var commands = module.exports = {
   "PASS": {
      "name":"pass",
      "server_responses": 
         [
           "ERR_NEEDMOREPARAMS"
         , "ERR_ALREADYREGISTRED"],
      "on_recieve":non
   },
   "NICK": {
      "name":"nick",
      "server_responses": 
      [
         "ERR_NONICKNAMEGIVEN",
         "ERR_ERRONEUSNICKNAME",
         "ERR_NICKNAMEINUSE",
         "ERR_NICKCOLLISION",
         "ERR_UNAVAILRESOURCE",
         "ERR_RESTRICTED"
         ],
      "on_recieve":non,
      "send": nick
   },
   "USER": {
      "name":"user",
      "server_responses": 
         [
           "ERR_NEEDMOREPARAMS"
         , "ERR_ALREADYREGISTRED"],
      "on_recieve":non,
      "error":user_err,
      "send":user,
   },
   "OPER": {
      "name":"oper",
      "server_responses": 
         [
           "ERR_NEEDMOREPARAMS"
         , "RPL_YOUREOPER"
         , "ERR_NOOPERHOST"
         , "ERR_PASSWDMISMATCH"],
      "on_recieve":non
   },
   /*
   +-
   The available modes are as follows:
   a - user is flagged as away;
   i - marks a users as invisible;
   w - user receives wallops;
   r - restricted user connection;
   o - operator flag;
   O - local operator flag;
   s - marks a user for receipt of server notices.
   */
   //TODO handle channel mode http://tools.ietf.org/html/rfc2812#section-3.2.3
   "MODE": {
      "name" : "mode",
      "server_responses": 
         [
           "ERR_NEEDMOREPARAMS"
         , "ERR_USERSDONTMATCH"
         , "ERR_UMODEUNKNOWNFLAG"
         , "RPL_UMODEIS"],
      "on_recieve": mode
   },
   "SERVICE": {
      "name":"service",
      "server_responses": [
          "ERR_ALREADYREGISTERED"
         ,"ERR_NEEDMOREPARAMS"
         ,"ERR_ERRONEUSNICKNAME"
         ,"RPL_YOURESERVICE"
         ,"RPL_YOURHOST"
         ,"RPL_MYINFO"
      ],
      "on_recieve":non
   },
   "QUIT": {
      "name":"quit",
      "server_responses": [],
      "on_recieve":non
   },
   "SQUIT": {
      "name":"squit",
      "server_responses": [
          "ERR_NOPRIVILEGES"
         ,"ERR_NOSUCHSERVER"
         ,"ERR_NEEDMOREPARAMS"
      ],
      "on_recieve":non
   },
   "JOIN": {
      "name":"join",
      "server_responses": [
             "ERR_NEEDMOREPARAMS"
            ,"ERR_BANNEDFROMCHAN"
            ,"ERR_INVITEONLYCHAN"
            ,"ERR_BADCHANNELKEY"
            ,"ERR_CHANNELISFULL"
            ,"ERR_BADCHANMASK"
            ,"ERR_NOSUCHCHANNEL"
            ,"ERR_TOOMANYCHANNELS"
            ,"ERR_TOOMANYTARGETS"
            ,"ERR_UNAVAILRESOURCE"
            ,"RPL_TOPIC"],
      "on_recieve":non
   },
   "PART": {
      "name":"part",
      "server_responses": [
          "ERR_NOTONCHANNEL"
         ,"ERR_NOSUCHCHANNEL"
         ,"ERR_NEEDMOREPARAMS"
      ],
      "on_recieve":non
   },
   "TOPIC": {
      "name" : "topic",
      "server_responses": 
         [
           "ERR_NEEDMOREPARAMS"
         , "ERR_NOTONCHANNEL"
         , "ERR_CHANOPRIVSNEEDED"
         , "RPL_TOPIC"
         , "RPL_NOTOPIC"
         , "ERR_NOCHANMODES"],
      "on_recieve": non
   },
   "NAMES": {
      "name" : "names",
      "server_responses": 
         [
           "ERR_TOOMANYMATCHES"
         , "ERR_NOSUCHSERVER"
         , "RPL_NAMREPLY"
         , "RPL_ENDOFNAMES"],
      "on_recieve": non
   },
   "LIST": {
      "name" : "list",
      "server_responses": [
          "ERR_TOOMANYMATCHES"
         ,"ERR_NOSUCHSERVER"
         ,"RPL_LIST"
         ,"RPL_LISTEND"
         ],
      "on_recieve": notice
   },
   "INVITE": {
      "name" : "invite",
      "server_responses": [
          "ERR_NEEDMOREPARAMS"
         ,"ERR_NOSUCHNICK"
         ,"ERR_NOTONCHANNEL"
         ,"ERR_USERONCHANNEL"
         ,"ERR_CHANOPRIVSNEEDED"
         ,"RPL_INVITING"
         ,"RPL_AWAY"
      ],
      "on_recieve": non
   },
   "KICK": {
      "name" : "kick",
      "server_responses": [
          "ERR_NEEDMOREPARAMS"
         ,"ERR_NOSUCHCHANNEL"
         ,"ERR_BADCHANMASK"
         ,"ERR_CHANOPRIVSNEEDED"
         ,"ERR_USERNOTINCHANNEL"
         ,"ERR_NOTONCHANNEL"
      ],
      "on_recieve": non
   },
   "PRIVMSG": {
      "name":"privmsg",
      "server_responses":[
          "ERR_NORECIPIENT"
         ,"ERR_NOTEXTTOSEND"
         ,"ERR_CANNOTSENDTOCHAN"
         ,"ERR_NOTOPLEVEL"
         ,"ERR_WILDTOPLEVEL"
         ,"ERR_TOOMANYTARGETS"
         ,"ERR_NOSUCHNICK"
         ,"RPL_AWAY"
         ],
      "on_recieve":prvmsg
   },
   "NOTICE": {
      "name" : "notice",
      "server_responses":[],
      "on_recieve": notice
   },
   "PING": {
      "name" : "ping",
      "server_responses":[],
      "on_recieve": ping_recieved,
      "send": non_send
   },
   "PONG":{
      "name":"pong",
      "server_responses":[],
      "on_recieve":non,
      "send": pong
   },
   "ERROR": {
      "name": "error",
      "server_responses":[],
      "on_recieve":non
   },
   "001": {
      "name":"RPL_WELCOME",
      "type":"no_reply",
      "on_recieve":non
   },
   "002": {
      "name":"RPL_YOURHOST",
      "type":"no_reply",
      "on_recieve":rpl_yourhost
   },
   "003": {
      "name":"RPL_CREATED",
      "type":"no_reply",
      "on_recieve":non
   },
   "004": {
      "name":"RPL_MYINFO",
      "type":"no_reply",
      "on_recieve":non
   },
   "005": {
      "name":"RPL_ISUPPORT",
      "type":"no_reply",
      "on_recieve":non
   },
   "250": {
      "name":"RPL_STATSCONN",
      "type":"no_reply",
      "on_recieve":non
   },
   "251": {
      "name":"RPL_LUSERCLIENT",
      "type":"no_reply",
      "on_recieve":non
   },
   "252": {
      "name":"RPL_LUSEROP",
      "type":"no_reply",
      "on_recieve":non
   },
   "253": {
      "name":"RPL_LUSERUNKNOWN",
      "type":"no_reply",
      "on_recieve":non
   },
   "254": {
      "name":"RPL_LUSERCHANNELS",
      "type":"no_reply",
      "on_recieve":non
   },
   "255": {
      "name":"RPL_LUSERME",
      "type":"no_reply",
      "on_recieve":non
   },
   "265": {
      "name":"RPL_LOCALUSERS",
      "type":"no_reply",
      "on_recieve":non
   },
   "266": {
      "name":"RPL_GLOBALUSERS",
      "type":"no_reply",
      "on_recieve":non
   },
   "328": {
      "name":"RPL_CHANNEL_URL",
      "on_recieve":non
   },
   "332": {
      "name":"RPL_TOPIC",
      "on_recieve":non
   },
   "333": {
      "name":"RPL_TOPICWHOTIME",
      "on_recieve":non
   },
   "353": {
      "name": "RPL_NAMREPLY",
      "on_recieve":non
   },
   "366": {
      "name": "RPL_ENDOFNAMES",
      "on_recieve":non
   },
   "375": {
      "name":"RPL_MOTDSTART",
      "type":"no_reply",
      "on_recieve":start_motd
   },
   "372": {
      "name":"RPL_MOTD",
      "type":"no_reply",
      "on_recieve":add_to_motd
   },
   "376": {
      "name":"RPL_ENDOFMOTD",
      "type":"no_reply",
      "on_recieve":end_motd
   },
   "432":{
      "name":"ERR_ERRONEUSNICKNAME",
      "on_recieve":err_erroneusnickname
   },
   "433": {
      "name":"ERR_NICKNAMEINUSE",
      "on_recieve":err_nicknameinuse
   },
   "451": {
      "name":"ERR_NOTREGISTERED",
      "on_recieve":err_notregistered
   },
   "461":{
      "name":"ERR_NEEDMOREPARAMS",
      "on_recieve":err_needmoreparams
   },
   "462": {
      "name":"ERR_ALREADYREGISTERED",
      "on_recieve":err_alreadyregistered
   }

}; 

var start_motd = function(client,rest_of_msg) 
   {client.motd = '';}

var add_to_motd = function(client,rest_of_msg) 
   {client.motd += rest_of_msg
      .replace(client.options.nick,'')
      .replace(':-','').trim() +'\n'}//clear freenode formatting

var end_motd = function(client,rest_of_msg) 
   {client.motd += '\n';}

var notice  = function(client,rest_of_msg) 
   {client.logger(1, 'NOTICE: '+rest_of_msg);}

var mode  = function(client,rest_of_msg) 
   {client.logger(0, 'modes recieved =>'+rest_of_msg);}

var pong = function(client,rest_of_msg) 
   {client.issueCommand('PONG',this.messageObj.server.trim());}

var prvmsg = function(client,rest_of_msg){
   var msgO = this.messageObj;
   var tokens = rest_of_msg.split(/\s/g);
   msgO.from = msgO.server.substring(0,msgO.server.indexOf('!'));
   msgO.to   = tokens[2].trim();
   msgO.what = tokens[3].trim();
   client.logger(0, msgO.from, msgO.to, msgO.what)
}

var non = function(client,rest_of_msg) {
   console.log('MESSAGE: '+this.messageObj.server+'::'+this.name+'::'+rest_of_msg)
}

//let's do this
//http://tools.ietf.org/html/rfc2812
//https://www.alien.net.au/irc/irc2numerics.html
module.exports = {
   "PASS": {
      "name":"pass",
      "server_responses": 
         [
           "ERR_NEEDMOREPARAMS"
         , "ERR_ALREADYREGISTRED"],
      "action":non
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
      "action":non
   },
   "USER": {
      "name":"user",
      "server_responses": 
         [
           "ERR_NEEDMOREPARAMS"
         , "ERR_ALREADYREGISTRED"],
      "action":non
   },
   "OPER": {
      "name":"oper",
      "server_responses": 
         [
           "ERR_NEEDMOREPARAMS"
         , "RPL_YOUREOPER"
         , "ERR_NOOPERHOST"
         , "ERR_PASSWDMISMATCH"],
      "action":non
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
      "action": mode
   },
   "SERVICE": {
      "name":"service",
      "server_responses": [
          "ERR_ALREADYREGISTRED"
         ,"ERR_NEEDMOREPARAMS"
         ,"ERR_ERRONEUSNICKNAME"
         ,"RPL_YOURESERVICE"
         ,"RPL_YOURHOST"
         ,"RPL_MYINFO"
      ],
      "action":non
   },
   "QUIT": {
      "name":"quit",
      "server_responses": [],
      "action":non
   },
   "SQUIT": {
      "name":"squit",
      "server_responses": [
          "ERR_NOPRIVILEGES"
         ,"ERR_NOSUCHSERVER"
         ,"ERR_NEEDMOREPARAMS"
      ],
      "action":non
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
      "action":non
   },
   "PART": {
      "name":"part",
      "server_responses": [
          "ERR_NOTONCHANNEL"
         ,"ERR_NOSUCHCHANNEL"
         ,"ERR_NEEDMOREPARAMS"
      ],
      "action":non
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
      "action": non
   },
   "NAMES": {
      "name" : "names",
      "server_responses": 
         [
           "ERR_TOOMANYMATCHES"
         , "ERR_NOSUCHSERVER"
         , "RPL_NAMREPLY"
         , "RPL_ENDOFNAMES"],
      "action": non
   },
   "LIST": {
      "name" : "list",
      "server_responses": [
          "ERR_TOOMANYMATCHES"
         ,"ERR_NOSUCHSERVER"
         ,"RPL_LIST"
         ,"RPL_LISTEND"
         ],
      "action": notice
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
      "action": non
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
      "action": non
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
      "action":prvmsg
   },
   "NOTICE": {
      "name" : "notice",
      "server_responses":[],
      "action": notice
   },
   "PING": {
      "name" : "ping",
      "server_responses":[],
      "action": pong
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
   "328": {
      "name":"RPL_CHANNEL_URL",
      "action":non
   },
   "332": {
      "name":"RPL_TOPIC",
      "action":non
   },
   "333": {
      "name":"RPL_TOPICWHOTIME",
      "action":non
   },
   "353": {
      "name": "RPL_NAMREPLY",
      "action":non
   },
   "366": {
      "name": "RPL_ENDOFNAMES",
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


exports.GetListeners = function(client) {
	var log = client.logger;

	var onconnect = function() {
		log(1,'reconnected');
		client.identify();
	}
	var buffer = '';
	var ondata = function(chunk) {
		buffer += chunk;
		// RFC spec says carriage returns are the thing that counts
		// to delimit messages 
		var messages = buffer.split('\r\n');
		// this ensures an incomplete chunk is ready for the rest
		// unless it is the last line, in which case this empties the messages
		buffer = messages.pop();

		try{
			for(var i in messages) {
				//as seen in IRCActions
				client.recieveRawMessage(messages[i]);
			}

		} catch(e) {
			log(0,"Error recieving raw message",e,messages);
		}
	}
	var onend = function() {log(0,"Connection ended by server (or something else)")}
	var onclose = function(){
		log(1,"disconnected");		
		//as seen in IRCActions
		try{
			client.connect();
		} catch (e) {
			log(0,"Error with client's attempt to reconnect",e);
		}
	}
	var onerror = function(exception) {
		log(0,"Connection facechecked a bush", exception)
	}
	
	return {
	 "connect"   :onconnect
	,"data"      :ondata
	,"end"       :onend
	,"close"     :onclose
	,"error"     :onerror
	}
}
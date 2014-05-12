
// this is initalized when this file is included
// so that client is put into scope for all the listeners
var client;

var onconnection = function() {}
var ondata = function(data) {}
var onend = function() {}
var onclose = function(){ }
var onerror = function() {}

exports.GetListeners = function(Client) {
	client = Client;
	return {
	 "connection":onconnection
	,"data"      :ondata
	,"end"       :onend
	,"close"     :onclose
	,"error"     :onerror
	}
}
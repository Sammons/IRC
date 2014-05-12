exports.GetOptions = function(custom_options) {
		var o = {};
		//default options
		o.host   = 'chat.freenode.org';
		o.port 	 = 6667
		o.secure = false
		o.debug  = true
		//apply custom options
		for (var i in custom_options) 
			o[i] = custom_options[i];
		return o;
	}
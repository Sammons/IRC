exports.GetOptions = function(custom_options) {
		var o = {};
		//default options for freenode
		o.host   = 'chat.freenode.org';
		o.port 	 = 6667
		o.secure = false
		o.debug  = 0
		o.nick   = 'butterslopt'
		o.user   = 'butter'
		o.usermode = 8
		o.realname = "ben"
		o.password = ""
		o.message_timeout = 5000
		//RFC defaults
	    o.features_supported = {
	        channel: {
	            idlength: [],
	            length: 200,
	            limit: [],
	            modes: { a: '', b: '', c: '', d: ''},
	            types: "&#"//local to server channels, and regular channels
	        },
	        kicklength: 0,
	        maxlist: [],
	        maxtargets: [],
	        modes: 3,
	        nicklength: 9,
	        topiclength: 0,
	        usermodes: ''
	    };

		//apply custom options
		for (var i in custom_options) 
			o[i] = custom_options[i];
		return o;
	}
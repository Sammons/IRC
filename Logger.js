var util = require('util');

exports.GetLogger = function(options) {
	var debug = options.debug;
	var log = function() {
		if (typeof(arguments[0]) === "number") {
			//real system-ish
			var importance = arguments[0];
			if (importance >= debug) {
				util.log('L'+arguments[0]+'msg: '+arguments[1]);
			}
		} else {
			//assume debug
			if (debug == 0) console.log.apply(this,arguments);
		}
	}
	return log;
}
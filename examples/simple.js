var bot_core = require('../index.js')

var bot = new bot_core({
	host: 'chat.freenode.net',
	nick: 'botterboy',
	channels: ['#bottychan']
});

bot.open();
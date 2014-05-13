exports.parse = function(raw,cb) {
    var client = this;
    var commands = client.commands;
    var msg = {};

    //TODO make this optional
    var color_regexp = /[\x02\x1f\x16\x0f]|\x03\d{0,2}(?:,\d{0,2})?/g
    raw = raw.replace(color_regexp, "");


    var tokens = raw.split(/\s/g);
    if (!client.host) client.host = tokens[0].slice(1).trim();
    
    //sometimes there is no server in the command 
    var commandObj = commands[tokens[0].trim()];
    
    if (commandObj === undefined)
        commandObj = commands[tokens[1].trim()];

    if (commandObj !== undefined) {
        commandObj.tokens = tokens;
        commandObj.on_recieve(client,raw);
        client.trigger(commandObj.name,raw,commandObj);
    }
    else {
        console.log(msg);
        throw('unsupported command',msg);
    }
    if (cb) {
        cb(commandObj);
    }
}

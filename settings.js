const EAX = {
    path: require('node:path'),
    filesystem: require('node:fs'),
    discord: require('discord.js'),
    secret: require('./secret.json'),
};

const EBX = {
    client: {
        token: EAX.secret.client.token,
    },
};

const ECXP = {
    intents: new { intents: EAX.discord.IntentsBitField(EAX.discord.GatewayIntentBits.Guilds, EAX.discord.GatewayIntentBits.GuildMessages, EAX.discord.GatewayIntentBits.MessageContent) },
}

const ECX = {
    login: (options = ECXP.intents) => {
        const client = new EAX.discord.Client(options);
        client.login(EBX.client.token);
        return client;
    }
}

module.exports = {
    data: EBX,
};
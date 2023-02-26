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
    intents: { intents: new EAX.discord.IntentsBitField(EAX.discord.GatewayIntentBits.Guilds, EAX.discord.GatewayIntentBits.GuildMessages, EAX.discord.GatewayIntentBits.MessageContent) },
    callbackClientReady: (client) => { console.log(`Login bem sucedido (${client.user.id}@${client.user.username})`); },
}

const ECXM = {
    client: (options = ECXP.intents) => { return new EAX.discord.Client(options) },
};

const ECX = {
    client: (options) => {
        return ECXM.client(options);
    },
    login: (options) => {
        const client = ECXM.client(options);
        client.login(EBX.client.token);
        client.once(EAX.discord.Events.ClientReady, ECXM.callbackClientReady);
        return client;
    }
}

module.exports = {
    data: EBX,
    ...ECX,
};
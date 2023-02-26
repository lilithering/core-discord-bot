const MOD = {
    filesystem: require('node:fs'),
    path: require('node:path'),
    secret: require('./secret.json'),
    discord: require('discord.js'),
};

const BASE = {
    client: {
        token: MOD.secret.client.token,
        default: {
            intents: [MOD.discord.GatewayIntentBits.Guilds, MOD.discord.GatewayIntentBits.MessageContent, MOD.discord.GatewayIntentBits.GuildMessages],
        }
    },
};

const MAKE = {
    client: (options = { intents: new MOD.discord.IntentsBitField(BASE.client.default.intents) }) => {
        const client = new MOD.discord.Client(options);
        return client;
    },
};

const DEFINES = {
    event: MOD.discord.Events,
};

module.exports = {
    mod: MOD,
    data: { ...BASE },
    make: MAKE,
    ...DEFINES,
};
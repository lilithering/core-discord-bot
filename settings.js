const MOD = {
    filesystem: require('node:fs'),
    path: require('node:path'),
    secret: require('./secret.json'),
    discord: require('discord.js'),
};

const BASE = {
    client: {
        token: MOD.secret.client.token,
    },
};

module.exports = {
    mod: MOD,
    data: { ...BASE },
};
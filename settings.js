const EAX = {
    path: require('node:path'),
    filesystem: require('node:fs'),
    discord: require('discord.js'),
    secret: require('./secret.json'),
};

const EBX = {
    client: {
        token: secret.client.token,
    },
};

module.exports = {
    data: EBX,
};
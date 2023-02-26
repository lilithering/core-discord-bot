const MOD = {
    filesystem: require('node:fs'),
    path: require('node:path'),
    secret: require('./secret.json'),
    discord: require('discord.js'),
};

const BASE = {
    filename: MOD.path.basename(__filename),
    client: {
        token: MOD.secret.client.token,
        default: {
            options: { intents: [MOD.discord.GatewayIntentBits.Guilds, MOD.discord.GatewayIntentBits.MessageContent, MOD.discord.GatewayIntentBits.GuildMessages], },
            callbacks: {
                ClientReady: async (client) => {
                    console.log(`"client" conectado com sucesso. ${client.user.id}/${client.user.username}`);
                },
                InteractionCreate: async (interaction) => {
                    if (!(interaction.isChatInputCommand())) {
                        interaction.client.commands.get(interaction.commandName).execute();
                    };
                },
            }
        }
    },
};

const MAKE = {};

const BUILD = {
    client: {
        base: (options = BASE.client.default.options) => {
            const client = new MOD.discord.Client(options);
            return client;
        },
        classic: (options = BASE.client.default.options) => {
            const client = new MOD.discord.Client(options);
            client.once(MOD.discord.Events.ClientReady, BASE.client.default.callbacks.ClientReady);
            return client;
        },
        commands: (options = BASE.client.default.options) => {
            const client = new MOD.discord.Client(options);
            client.once(MOD.discord.Events.ClientReady, BASE.client.default.callbacks.ClientReady);
            client.on(MOD.discord.Events.InteractionCreate, BASE.client.default.callbacks.InteractionCreate);
            return client;
        },
    },
    command: (name, execute) => {
        // ! set path
        const filename = MOD.path.join(MOD.path.parse(__filename).dir, 'commands', `${name}.js`);
        // ! set data
        let data = [];
        data.push('// core-discord-bot autobuilder, https://github.com/lilithering/core-discord-bot');
        data.push(`const core = require('./../${BASE.filename}');`);
        data.push(`module.exports = { name: ${name}, execute: async (interaction)=>{(${execute.toString()})(interaction)}};`);
        data = data.join('\n');
        // ! write file
        MOD.filesystem.writeFileSync(filename, data);
    }
};

const DEFINES = {
    event: MOD.discord.Events,
};

module.exports = {
    mod: MOD,
    data: { ...BASE },
    make: MAKE,
    build: BUILD,
    ...DEFINES,
};
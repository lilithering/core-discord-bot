const MOD = {
    filesystem: require('node:fs'),
    path: require('node:path'),
    secret: require('./secret.json'),
    discord: require('discord.js'),
};

const BASE = {
    encoding: 'utf-8',
    filename: MOD.path.basename(__filename),
    folder: MOD.path.parse(__filename).dir,
    client: {
        token: MOD.secret.client.token,
        default: {
            options: { intents: [MOD.discord.GatewayIntentBits.Guilds, MOD.discord.GatewayIntentBits.MessageContent, MOD.discord.GatewayIntentBits.GuildMessages], },
            callbacks: {
                ClientReady: async (client) => {
                    console.log(`"client" conectado com sucesso. ${client.user.id}/${client.user.username}`);
                },
                InteractionCreate: async (interaction) => {
                    if (!interaction.isChatInputCommand()) return
                    interaction.reply('ok');
                },
            }
        }
    },
};

const MAKE = {};

const CALL = {
    dir: (folder) => {
        const path = MOD.path.join(BASE.folder, 'commands');
        return MOD.filesystem.readdirSync(path);
    },
}

const GET = {
    commandFiles: () => {
        return CALL.dir('commands').filter(file => { return file.endsWith('.js') });
    },
    command: (file) => {
        return require(MOD.path.join(BASE.folder, 'commands', file));
    }
};

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
            // ! set client
            const client = new MOD.discord.Client(options);
            // ! init commands
            const commands = [];
            // ! get commands files
            const commandFiles = GET.commandFiles();
            // <file>
            for (file of commandFiles)
            {
                // ! get command
                const command = GET.command(file);
                // ! insert command file
                commands.push(command);
            }
            // ! set client commands
            client.commands = commands;
            // @ClientReady
            client.once(MOD.discord.Events.ClientReady, BASE.client.default.callbacks.ClientReady);
            // @InteractionCreate
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
        data.push(`module.exports = { name: '${name}', execute: async (interaction)=>{(${execute.toString()})(interaction)}};`);
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
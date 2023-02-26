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
    self: {
        path: __filename,
        filename: EAX.path.parse(__filename).name,
        dir: EAX.path.parse(__filename).dir,
    },
    mod: {
        command: {
            folder: 'commands',
        },
    },
};

const ECXP = {
    intents: { intents: new EAX.discord.IntentsBitField(EAX.discord.GatewayIntentBits.Guilds, EAX.discord.GatewayIntentBits.GuildMessages, EAX.discord.GatewayIntentBits.MessageContent) },
}

const ECXM = {
    client: (options = ECXP.intents) => { return new EAX.discord.Client(options) },
    rest: () => { return new EAX.discord.REST({ version: '10' }).setToken(EBX.client.token); },
};

const ECXCB = {
    callbackClientReady: (client) => { console.log(`Login bem sucedido (${client.user.id}@${client.user.username})`); },
}

const ECX = {
    client: (options) => {
        return ECXM.client(options);
    },
    login: (options) => {
        const client = ECXM.client(options);
        client.login(EBX.client.token);
        client.once(EAX.discord.Events.ClientReady, ECXCB.callbackClientReady);
        return client;
    },
    command: (name, description, content) => {
        const path = EAX.path.join(EBX.self.dir, EBX.mod.command.folder, name.concat('.js'));
        const data = [`// archanisther`];
        data.push(`const core = require('./../${EBX.self.filename}');`);
        data.push(`module.exports = { `);
        data.push(`\tdata: new core.mod.slash().setName('${name}').setDescription('${description}'), `);
        data.push(`\texecute: async ${content},};`);
        EAX.filesystem.writeFileSync(path, data.join('\n'));
    },
    deployCommands: () => {
        const rest = ECXM.rest();
        const client = ECXM.client();
        const commands = [];
        const files = EAX.filesystem.readdirSync(EAX.path.join(EBX.self.dir, EBX.mod.command.folder));
        for (file of files) {
            const path = './'.concat(EAX.path.join(EBX.mod.command.folder, file));
            commands.push(require(path).data.toJSON());
        };
        (async () => {
            await client.login(EBX.client.token);
            await rest.put(EAX.discord.Routes.applicationCommands(client.user.id), { body: commands, });
            console.log('Comandos adicionados com sucesso!');
            client.destroy();
        })();
    },
};

const EDX = {
    slash: EAX.discord.SlashCommandBuilder,
};

module.exports = {
    data: EBX,
    mod: EDX,
    ...ECX,
};
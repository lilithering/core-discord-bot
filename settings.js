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

const IABX = {
    label: 'lothusgpt',
};

const IAEX = {
    knowledges: {
        laboratorio: /^labor[a-z]rio/i,
    },
}

const IAAX = {
    trigger: {
        labs: [/(traga para|me diga)/i, (word) => {
            // @debug
            console.log(`word> ${word}`);
            // traga para mim os resultados do laboratório globo-frontend
        }],
    }
};

const IACX = {
    get: (interaction) => {
        return interaction.options.get(IABX.label);
    },
    read: (data) => {
        for (content in IAAX.trigger) {
            console.log(`content> ${content}`);
            console.log(`data> ${data}`);
            console.log(`IAAX.trigger[content]> ${IAAX.trigger[content]}`);
            console.log(`expr> ${data.value.match(IAAX.trigger[content][0])}`);
            return true;
            if (data.value.match(IAAX.trigger[content][0])) {
                return IAAX.trigger[content][1](data.value);
            }
        }
        return null;
    },
};

const ECXP = {
    intents: { intents: new EAX.discord.IntentsBitField(EAX.discord.GatewayIntentBits.Guilds, EAX.discord.GatewayIntentBits.GuildMessages, EAX.discord.GatewayIntentBits.MessageContent) },
}

const ECXE = {
    commands: (custom = (x) => { return x }) => {
        const commands = [];
        const files = EAX.filesystem.readdirSync(EAX.path.join(EBX.self.dir, EBX.mod.command.folder));
        for (file of files) {
            const path = './'.concat(EAX.path.join(EBX.mod.command.folder, file));
            commands.push(require(path));
        };
        return commands.map(custom);
    },
};

const ECXM = {
    base: (options = ECXP.intents) => {
        const client = new EAX.discord.Client(options);
        return client;
    },
    client: (options = ECXP.intents) => {
        const client = new EAX.discord.Client(options);
        const commands = ECXE.commands();
        client.commands = new EAX.discord.Collection();
        for (command of commands) {
            client.commands.set(command.data.name, command);
        }
        return client;
    },
    rest: () => { return new EAX.discord.REST({ version: '10' }).setToken(EBX.client.token); },
};

const ECXCB = {
    ClientReady: (client) => { console.log(`Login bem sucedido (${client.user.id}@${client.user.username})`); },
    InteractionCreate: async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        const cmd = interaction.client.commands.get(interaction.commandName);
        try {
            await cmd.execute(interaction);
        } catch (err) {
            interaction.followUp({ content: 'Ocorreu um erro ao executar o seu comando.', ephemeral: true });
            console.error(err);
        };
    },
};

const ECX = {
    clientBase: (options) => {
        return ECXM.base(options);
    },
    clientStored: (options) => {
        return ECXM.client(options);
    },
    client: (options) => {
        const client = ECXM.client(options);
        client.once(EAX.discord.Events.ClientReady, ECXCB.ClientReady);
        client.on(EAX.discord.Events.InteractionCreate, ECXCB.InteractionCreate);
        return client;
    },
    login: (options) => {
        const client = ECXM.base(options);
        client.login(EBX.client.token);
        client.once(EAX.discord.Events.ClientReady, ECXCB.ClientReady);
        return client;
    },
    command: (name, description, content, settings = '') => {
        const path = EAX.path.join(EBX.self.dir, EBX.mod.command.folder, name.concat('.js'));
        const data = [`// archanisther`];
        data.push(`const core = require('./../${EBX.self.filename}');`);
        data.push(`module.exports = { `);
        data.push(`\tdata: new core.api.SlashCommandBuilder().setName('${name}').setDescription('${description}')${settings}, `);
        data.push(`\texecute: ${content},};`);
        EAX.filesystem.writeFileSync(path, data.join('\n'));
    },
    deployCommands: () => {
        const rest = ECXM.rest();
        const client = ECXM.base();
        const commands = ECXE.commands((x) => { return x.data.toJSON() });
        (async () => {
            await client.login(EBX.client.token);
            await rest.put(EAX.discord.Routes.applicationCommands(client.user.id), { body: commands, });
            console.log('Comandos adicionados com sucesso!');
            client.destroy();
        })();
    },
    flushCommands: () => {
        const path = EAX.path.join(EBX.self.dir, EBX.mod.command.folder);
        EAX.filesystem.rmSync(path, { recursive: true, force: true });
        EAX.filesystem.mkdirSync(path);
    },
};

const EDX = {
    data: EBX,
    api: EAX.discord,
    ia: { ...IABX, ...IAAX, ...IAEX, ...IACX },
};

module.exports = {
    ...EDX,
    ...ECX,
};
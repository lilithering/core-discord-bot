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
    knowledge: {
        'laboratório': /lab[a-z]+rio ([-a-z]+)/i,
    },
}

const IAAX = {
    trigger: {
        labs: [/(traga para|me (diga|conte|fala)|conte me)|qual (é|e|o)|diga me/i, (interaction, data) => {
            // traga para mim os resultados do laboratório globo-frontend
            // <about>
            for (const about in IAEX.knowledge) {
                console.log(`\n\nexpr> ${data.value.match(IAEX.knowledge[about])}\ndata.value> ${data.value}\nIAEX.knowledge[about]> ${IAEX.knowledge[about]}`);
                if (match = data.value.match(IAEX.knowledge[about])) {
                    // get all lab channels...
                    if (match[1]) {
                        return `Estamos falando sobre o laboratório: ${match[1]}`;
                    }
                    return `Desculpe, não conheço esse laboratório.`;
                }
            };
            return `Não consegui identificar sobre o que estamos falando ${interaction.user.username}.`;
        }],
    }
};

const IACX = {
    read: (interaction) => {
        const data = interaction.options.get(IABX.label);
        for (content in IAAX.trigger) {
            // @debug
            console.log(`\n\nIAAX.trigger[content][0]> ${IAAX.trigger[content][0]}\ndata.value> ${data.value}\nexpr> ${data.value.match(IAAX.trigger[content][0])}`)
            if (data.value.match(IAAX.trigger[content][0])) {
                return IAAX.trigger[content][1](interaction, data);
            }
        }
        return 'Hmmm... Não sei fazer isso.';
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
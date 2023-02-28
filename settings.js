const EAX = {
    path: require('node:path'),
    filesystem: require('node:fs'),
    https: require('node:https'),
    child_process: require('node:child_process'),
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
    drive: {
        folder: 'issues',
        prefix: 'gdrive-',
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
        const data = [`// autogen core-discord-bot made by Lilithering, https://github.com/lilithering/core-discord-bot`];
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
    cloud: async (url) => {
        return new Promise((resolve) => {
            const handle = new Promise((resolve) => {
                // ! google request
                const google = EAX.https.request(new URL(url), async (google_res) => {
                    // ! drive request
                    const drive = EAX.https.request(new URL(google_res.headers['location']), (drive_res) => {
                        // ! init buffer
                        let buffer = '';
                        // ! get data payload
                        drive_res.on('data', chunk => {
                            buffer += chunk.toString();
                        });
                        // ! end
                        drive_res.on('end', () => {
                            resolve(buffer);
                        })
                    });
                    drive.end();
                });
                google.end();
            });
            handle.then((data) => { resolve(data); });
        })
    },
    driver: (script, content) => {
        const driver = EAX.child_process.spawnSync('py', [script], { encoding: 'utf-8', input: content });
        if (driver.error) console.log(driver.error);

        return JSON.parse(driver.stdout);
    }
};

const IABX = {
    label: 'lothusgpt',
    drive: {
        "globo-frontend": 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBiT5NX_LJJnMzTx9NjBFkzvXe83g5CAdmPYJhWEai3n7RT1Gt0zGJLO3QEVcNzs-y_WFOdBKYG57j/pub?output=csv',
    },
};

const IAEX = {
    knowledge: {
        'laboratório': /lab[a-z]+rio ([-a-z]+)/i,
    },
}

const IAXX = {
    channelsByType: (interaction, type) => {
        return interaction.guild.channels.cache
            .filter(channel => channel.constructor.name === type)
            .map((channel) => { return channel.name });
    },
    searchEngine: (search, engine) => {
        // ! init data arr
        var data = [];

        // ! make base expr
        const base = /[bcdfghjklmnpqrstvwxz]+[aeiou -]?/gi;

        // ! make main object
        const main = search.match(base);

        // ! setup main registry
        var RX = 0;

        // <word>
        for (word of engine) {
            // ! make mirror object
            const mirror = word.match(base);

            // ! setup sub registry
            var RA = [];
            var RB = 0;
            var RC = 0;

            // <main_depth>
            for (var main_depth = 0; main_depth < main.length; main_depth++) {
                // <mirror_depth>
                for (var mirror_depth = RC; mirror_depth < mirror.length; mirror_depth++) {
                    if (main[main_depth] === mirror[mirror_depth]) {
                        RB++;
                        RC = mirror_depth + 1;
                        break;
                    } else {
                        RA.push(RB);
                        RC = 0;
                    };
                };
            };

            // ! set word score
            var score = RA.sort().pop();

            if (RA?.length) {
                if (score > RX) {
                    // ! clear data
                    data = [];
                    // ! set new main registry
                    RX = score;
                    // ! put data
                    data.push({ score: score, sentence: word });
                } else if (score == RX) {
                    // ! put data
                    data.push({ score: score, sentence: word });
                }
            } else {
                // ! set score value if undefined
                score = main.length;
                // ! clear data
                data = [];
                // ! set new main registry
                RX = main.length;
                // ! put data
                data.push({ score: score, sentence: word });
            };
        };
        // object with data
        return data;
    },

};

const IAAX = {
    trigger: {
        labs: [/(traga para|me (diga|conte|fala)|conte me|qual (é|e|o)|diga me)/i, (interaction, data) => {
            for (const about in IAEX.knowledge) {
                if (match = data.value.match(IAEX.knowledge[about])) {
                    const forumChannels = IAXX.channelsByType(interaction, 'ForumChannel');
                    const search = match[1];
                    const data = IAXX.searchEngine(search, forumChannels);

                    if (data.length === 1) {
                        (async () => {
                            const username = interaction.user.username;
                            const labname = IABX.drive[data[0].sentence];
                            const content = await ECX.cloud(labname);
                            const dataframe = ECX.driver('laboratorio.py', content);
                            // @debug
                            console.log('cloud>');
                            console.log(content);
                            // @debug
                            console.log('dataframe>');
                            console.log(dataframe);

                            if (dataframe[username]) {
                                var rax = {
                                    A: 0,
                                    B: 0,
                                    C: 0,
                                };

                                var rbx = {
                                    A: [],
                                    B: [],
                                    C: [],
                                };

                                for (const token in dataframe[username]) {
                                    const value = rax[dataframe[username][token]];
                                    if (typeof (value) == typeof (0)) {
                                        rax[value]++;
                                        rbx[value].push(token);
                                    }
                                    else {
                                        rax.C++;
                                        rbx.C.push(token);
                                    }
                                };

                                var output = `Você possuí ${av.C} tópicos para aprender`;
                                output += av.B ? `, tem ${av.B} para melhorar.` : '.';
                                output += av.A ? ` **Já *domina* ${av.A} tópicos!**` : '';
                                output += av.C ? `${'\`\`\`\n**Tópicos para aprender:**\n' + reg.C.join('\n')
                                    + (av.B ? '\n\n**Tópicos para melhorar:**\n' + reg.B.join('\n').concat('\n') : '')
                                    + '\n\`\`\`'}` : '';

                                return output;
                            }
                            else {
                                return 'Acho que você não está registrado nesse laboratório.';
                            }

                        })()

                    } else if (data.length > 1) {
                        // @debug
                        var debug = data;
                        console.log('debug>');
                        console.log(debug);
                        return `Estou em dúvida sobre qual laboratório estamos falando...\n> ${data.map(x => x.sentence).join(', ')}`;
                    } else {
                        return `Desculpe, não conheço esse laboratório.`;
                    }
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
            if (data.value.match(IAAX.trigger[content][0])) {
                return IAAX.trigger[content][1](interaction, data);
            }
        }
        return 'Hmmm... Não sei fazer isso.';
    },
};

const EDX = {
    data: EBX,
    api: EAX.discord,
    ia: { ...IABX, ...IAAX, ...IAEX, ...IACX },
};

module.exports = {
    ...ECX,
    ...EDX,
};
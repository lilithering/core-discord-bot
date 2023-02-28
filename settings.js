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
        commands: {
            folder: 'commands',
        },
        drivers: {
            folder: 'drivers',
        },
    },
};

const ECXB = {
    intents: { intents: new EAX.discord.IntentsBitField(EAX.discord.GatewayIntentBits.Guilds, EAX.discord.GatewayIntentBits.GuildMessages, EAX.discord.GatewayIntentBits.MessageContent) },
}

const ECXRAX = {
    commands: (custom = (x) => { return x }) => {
        const commands = [];
        const files = EAX.filesystem.readdirSync(EAX.path.join(EBX.self.dir, EBX.mod.commands.folder));
        for (file of files) {
            const path = './'.concat(EAX.path.join(EBX.mod.commands.folder, file));
            commands.push(require(path));
        };
        return commands.map(custom);
    },
};

const ECXRA2 = {
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

const ECXRA = {
    base: (options = ECXB.intents) => {
        const client = new EAX.discord.Client(options);
        return client;
    },
    client: (options = ECXB.intents) => {
        const client = new EAX.discord.Client(options);
        const commands = ECXRAX.commands();
        client.commands = new EAX.discord.Collection();
        for (command of commands) {
            client.commands.set(command.data.name, command);
        }
        return client;
    },
    rest: () => { return new EAX.discord.REST({ version: '10' }).setToken(EBX.client.token); },
};

const ECX = {
    clientBase: (options) => {
        return ECXRA.base(options);
    },
    clientStored: (options) => {
        return ECXRA.client(options);
    },
    client: (options) => {
        const client = ECXRA.client(options);
        client.once(EAX.discord.Events.ClientReady, ECXRA2.ClientReady);
        client.on(EAX.discord.Events.InteractionCreate, ECXRA2.InteractionCreate);
        return client;
    },
    login: (options) => {
        const client = ECXRA.base(options);
        client.login(EBX.client.token);
        client.once(EAX.discord.Events.ClientReady, ECXRA2.ClientReady);
        return client;
    },
    command: (name, description, content, settings = '') => {
        const path = EAX.path.join(EBX.self.dir, EBX.mod.commands.folder, name.concat('.js'));
        const data = [`// autogen core-discord-bot made by Lilithering, https://github.com/lilithering/core-discord-bot`];
        data.push(`const core = require('./../${EBX.self.filename}');`);
        data.push(`module.exports = { `);
        data.push(`\tdata: new core.api.SlashCommandBuilder().setName('${name}').setDescription('${description}')${settings}, `);
        data.push(`\texecute: ${content},};`);
        EAX.filesystem.writeFileSync(path, data.join('\n'));
    },
    deployCommands: () => {
        const rest = ECXRA.rest();
        const client = ECXRA.base();
        const commands = ECXRAX.commands((x) => { return x.data.toJSON() });
        (async () => {
            await client.login(EBX.client.token);
            await rest.put(EAX.discord.Routes.applicationCommands(client.user.id), { body: commands, });
            console.log('Comandos adicionados com sucesso!');
            client.destroy();
        })();
    },
    flushCommands: () => {
        const path = EAX.path.join(EBX.self.dir, EBX.mod.commands.folder);
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
        const path = EAX.path.join(EBX.self.dir, EBX.mod.drivers.drivers.folder, script);
        const driver = EAX.child_process.spawnSync('py', [path], { encoding: 'utf-8', input: content });
        if (driver.stderr) console.log(Error(driver.stderr));

        return JSON.parse(driver.stdout);
    }
};

const IABX = {
    label: 'lothusgpt',
    drive: {
        "globo-frontend": 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBiT5NX_LJJnMzTx9NjBFkzvXe83g5CAdmPYJhWEai3n7RT1Gt0zGJLO3QEVcNzs-y_WFOdBKYG57j/pub?output=csv',
    },
};

const IABXRAX = {
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

const IABXRA = {
    knowledge: {
        'laboratório': [/lab[a-z]+rio ([-a-z]+)/i, async (interaction, match) => {
            return new Promise(resolve => {
                const forumChannels = IABXRAX.channelsByType(interaction, 'ForumChannel');
                const search = match[1];
                const data = IABXRAX.searchEngine(search, forumChannels);

                if (data.length === 1) {
                    (async () => {
                        const username = interaction.user.username;
                        const docurl = IABX.drive[data[0].sentence];
                        console.log('docurl>')
                        console.log(docurl)
                        if (docurl) {
                            const content = await ECX.cloud(docurl);
                            const dataframe = ECX.driver('laboratorio.py', content);

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
                                    const value = dataframe[username][token];
                                    if (typeof (rax[value]) == typeof (0)) {
                                        rax[value]++;
                                        rbx[value].push(token);
                                    }
                                    else {
                                        rax.C++;
                                        rbx.C.push(token);
                                    }
                                };

                                var output = []
                                output.push(`Você possuí ${rax.C} tópicos para aprender`);
                                output.push(rax.B ? `, tem ${rax.B} para melhorar. ` : '. ');
                                output.push(rax.A ? `**Já *domina* ${rax.A} tópicos!**\n` : '\n');
                                output.push(rax.C ? `\n**Tópicos para aprender:**\n${rbx.C.join('\n')}\n` : '');
                                output.push(rax.B ? `\n**Tópicos para melhorar:**\n${rbx.B.join('\n')}\n` : '');

                                resolve(output.join(''));
                            }
                            else {
                                resolve('Acho que você não está registrado nesse laboratório.');
                            }
                        }
                        else {
                            resolve(`Não consegui acessar a planilha com as informações.`);
                        }
                    })();
                }
                else if (data.length > 1) {
                    resolve(`Estou em dúvida sobre qual laboratório estamos falando...\n> ${data.map(x => x.sentence).join(', ')}`);
                }
                else {
                    resolve(`Desculpe, não conheço esse laboratório.`);
                };
            });
        }],
    },
}

const IAAXRA = {
    cognition: {
        default: [/(traga para|me (diga|conte|fala)|conte me|qual (é|e|o)|diga me|fala ai)/i, async (interaction, data) => {
            for (const about in IABXRA.knowledge) {
                const expr = IABXRA.knowledge[about][0];
                if (match = data.value.match(expr)) {
                    const engine = IABXRA.knowledge[about][1]
                    return await engine(interaction, match);
                }
                return `Não consegui identificar sobre o que estamos conversando ${interaction.user.username}. Desculpe.`;
            };
        }],
    },
};

const IAAX = {
    read: async (interaction) => {
        const data = interaction.options.get(IABX.label);
        console.log('Start deferReply')
        interaction.deferReplys();
        console.log('End deferReply')

        for (const content in IAAXRA.cognition) {
            const expr = IAAXRA.cognition[content][0];
            if (data.value.match(expr)) {
                const engine = IAAXRA.cognition[content][1];
                return await engine(interaction, data);
            }
        }
        return 'Hmmm... Não sei fazer isso.';
    },
};

const EDX = {
    data: EBX,
    api: EAX.discord,
    ia: { ...IAAX, ...IAAXRA, ...IABX, ...IABXRA },
};

module.exports = {
    ...ECX,
    ...EDX,
};
const BUILTIN = {
    filesystem: require('node:fs'),
    path: require('node:path'),
};

const IMPORTS = {
    discord: () => {
        try {
            return require('discord.js')
        }
        catch (err) {
            const version = '14.7.1';
            console.error(`Esse núcleo requer o módulo (discord.js) versão ${version} ou superior.\nExecute o comando:\nnpm install discord.js@^${version}`);
            console.error('Ou adicione: "discord.js": "^14.7.1" em dependencies no seu arquivo package.json.');
        };
    },
    secret: () => {
        let _filename = 'secret.json';
        try {
            return require(`./${_filename}`);
        }
        catch (err) {
            console.log(`Criando o arquivo ${_filename} ...`);
            const data = { client: {} };
            const prompt = require('node:readline').createInterface(process.stdin, process.stdout);
            prompt.question('Digite o TOKEN do bot: ', (input) => {
                data.client.token = input;
                prompt.close();
            });
            prompt.on('close', () => {
                BUILTIN.filesystem.writeFileSync(_filename, JSON.stringify(data));
                process.exit(0);
            });
        };
    },
};

for (mod in IMPORTS) {
    IMPORTS[mod]();
}


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
            console.error(`ERRO!\nEsse núcleo requer o módulo (discord.js) versão ${version} ou superior.\n-------\n\nExecute o comando:\nnpm install discord.js@^${version}\n\nOu\n\nAdicione: "discord.js": "^14.7.1"\nem 'dependencies' no seu arquivo package.json, e execute o comando:\nnpm install`);
            process.exit();
        };
    },
    secret: () => {
        let _filename = 'secret.json';
        let _path = BUILTIN.path.resolve(_filename);
        try {
            return require(_path);
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
                BUILTIN.filesystem.writeFileSync(_path, JSON.stringify(data));
                process.exit(0);
            });
        };
    },
};

for (mod in IMPORTS) {
    IMPORTS[mod]();
}


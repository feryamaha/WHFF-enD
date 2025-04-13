const fs = require('fs');
const { execSync, spawn } = require('child_process');
const path = require('path');

// Função para encontrar o arquivo bundle mais recente
function findLatestBundle() {
    const distDir = path.join(__dirname, '../dist');

    // Verifica se o diretório dist existe
    if (!fs.existsSync(distDir)) {
        console.error('❌ Diretório dist não encontrado. Execute YARN BUILD primeiro.');
        return null;
    }

    const files = fs.readdirSync(distDir);

    // Procura por arquivos que começam com 'bundle' e terminam com '.js'
    const bundleFiles = files.filter(file =>
        file.startsWith('bundle') && file.endsWith('.js')
    );

    if (bundleFiles.length === 0) {
        console.error('❌ Nenhum arquivo bundle encontrado na pasta dist');
        return null;
    }

    // Retorna o arquivo mais recente
    return bundleFiles.reduce((latest, current) => {
        const latestPath = path.join(distDir, latest);
        const currentPath = path.join(distDir, current);
        return fs.statSync(latestPath).mtime > fs.statSync(currentPath).mtime ? latest : current;
    });
}

// Função para esperar um tempo específico
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para executar o servidor de desenvolvimento
async function runDevServer() {
    return new Promise((resolve, reject) => {
        console.log('🚀 Iniciando YARN DEV servidor de desenvolvimento automaticamente...');

        try {
            const dev = spawn('yarn', ['dev'], {
                stdio: 'inherit',
                shell: true,
                windowsHide: false
            });

            // Contagem regressiva de 30 segundos
            let secondsLeft = 30;
            console.log(`⏱️ Iniciando teste de carregamento da página. Tempo restante: ${secondsLeft} segundos`);

            const countdownInterval = setInterval(() => {
                secondsLeft--;
                if (secondsLeft > 0) {
                    console.log(`⏱️ Teste em andamento. Tempo restante: ${secondsLeft} segundos`);
                } else {
                    clearInterval(countdownInterval);
                    console.log('⏱️ Tempo de teste de carregamento da pagina, encerrando servidor em 30 segundos...');
                    dev.kill();
                    resolve();
                }
            }, 1000);

            dev.on('error', (error) => {
                console.error('❌ Erro ao iniciar servidor de desenvolvimento:', error.message);
                clearInterval(countdownInterval);
                reject(error);
            });
        } catch (error) {
            console.error('❌ Erro ao iniciar servidor de desenvolvimento:', error.message);
            reject(error);
        }
    });
}

// Função para atualizar a branch gh-pages corretamente
async function updateGhPages() {
    try {
        console.log('🔄 Iniciando atualização da branch gh-pages...');

        // 1. Primeiro, faz o build do projeto
        console.log('🛠️ Gerando build de produção...');
        execSync('yarn build', { stdio: 'inherit' });

        // 2. Copia os arquivos necessários antes do checkout
        console.log('📋 Copiando arquivos da dist...');
        const tempDir = path.join(__dirname, '../temp_deploy');
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        fs.mkdirSync(tempDir);

        const distFiles = fs.readdirSync(path.join(__dirname, '../dist'));
        for (const file of distFiles) {
            const srcPath = path.join(__dirname, '../dist', file);
            const destPath = path.join(tempDir, file);
            if (fs.lstatSync(srcPath).isDirectory()) {
                fs.cpSync(srcPath, destPath, { recursive: true });
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }

        // 3. Faz checkout para gh-pages
        console.log('🔄 Fazendo checkout para gh-pages...');
        execSync('git checkout gh-pages', { stdio: 'inherit' });

        // 4. Remove arquivos antigos da gh-pages (exceto .git)
        console.log('🗑️ Limpando arquivos antigos...');
        const files = fs.readdirSync('.');
        for (const file of files) {
            if (file !== '.git' && file !== 'temp_deploy') {
                if (fs.lstatSync(file).isDirectory()) {
                    fs.rmSync(file, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(file);
                }
            }
        }

        // 5. Cola os arquivos copiados na gh-pages
        console.log('📋 Colando arquivos na gh-pages...');
        const tempFiles = fs.readdirSync(tempDir);
        for (const file of tempFiles) {
            const srcPath = path.join(tempDir, file);
            const destPath = path.join('.', file);
            if (fs.lstatSync(srcPath).isDirectory()) {
                fs.cpSync(srcPath, destPath, { recursive: true });
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }

        // 6. Remove o diretório temporário
        fs.rmSync(tempDir, { recursive: true, force: true });

        // 7. Adiciona e commita as alterações
        console.log('💾 Salvando alterações na gh-pages...');
        execSync('git add .', { stdio: 'inherit' });
        execSync('git commit -m "chore: atualiza gh-pages com build mais recente"', { stdio: 'inherit' });

        // 8. Push para gh-pages
        console.log('⬆️ Enviando alterações para o repositório remoto...');
        execSync('git push -f origin gh-pages', { stdio: 'inherit' });

        // 9. Volta para a branch main
        console.log('🔄 Voltando para a branch main...');
        execSync('git checkout main', { stdio: 'inherit' });

        console.log('✅ Branch gh-pages atualizada com sucesso');
    } catch (error) {
        console.error('❌ Erro ao atualizar gh-pages:', error.message);
        // Em caso de erro, volta para a branch main
        execSync('git checkout main', { stdio: 'inherit' });
        // Remove diretório temporário se existir
        const tempDir = path.join(__dirname, '../temp_deploy');
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    }
}

// Função para fazer o commit e atualizar o repositório
async function makeCommitAndPush(bundleName) {
    try {
        // Adiciona todas as alterações
        execSync('git add .', { stdio: 'inherit' });

        // Cria o commit com o nome do bundle
        const commitMessage = `build: novo hash/bundle gerado - ${bundleName}`;
        execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

        // Push para a branch main (com force)
        console.log('⬆️ Enviando alterações para a branch main...');
        execSync('git push -f origin main', { stdio: 'inherit' });

        // Atualiza a branch gh-pages
        await updateGhPages();

        console.log(`✅ Processo realizado com sucesso para o bundle: ${bundleName}`);
    } catch (error) {
        console.error('❌ Erro durante o processo:', error.message);
    }
}

// Função principal
async function main() {
    try {
        console.log('🔍 Verificando novo bundle...');

        // Encontra o novo bundle gerado
        const latestBundle = findLatestBundle();
        if (!latestBundle) {
            console.log('❌ Nenhum arquivo bundle encontrado na pasta dist');
            return;
        }

        console.log(`📦 Bundle encontrado: ${latestBundle}`);

        // Executa o servidor de desenvolvimento
        console.log('🚀 Iniciando servidor de desenvolvimento automaticamente...');
        await runDevServer();

        // Faz o commit e atualiza o repositório
        await makeCommitAndPush(latestBundle);

        console.log('✅ Processo foi finalizado com sucesso!');
    } catch (error) {
        console.error('❌ Erro durante o processo:', error.message);
    }
}

// Executa o script
console.log('🔄 Iniciando script de auto-commit...');
main(); 
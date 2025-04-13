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
        console.log('🔄 Atualizando branch gh-pages...');

        // 1. Salva o conteúdo atual da main
        console.log('📋 Copiando arquivos da branch main...');
        const mainFiles = execSync('git ls-tree -r main --name-only').toString().split('\n');

        // 2. Faz checkout para gh-pages
        console.log('🔄 Fazendo checkout para gh-pages...');
        execSync('git checkout gh-pages', { stdio: 'inherit' });

        // 3. Copia cada arquivo da main para gh-pages
        console.log('📋 Colando arquivos na branch gh-pages...');
        for (const file of mainFiles) {
            if (file) {
                try {
                    const content = execSync(`git show main:${file}`).toString();
                    fs.writeFileSync(file, content);
                } catch (error) {
                    console.log(`Arquivo ${file} não existe na main, pulando...`);
                }
            }
        }

        // 4. Adiciona e commita as alterações
        console.log('💾 Salvando alterações na gh-pages...');
        execSync('git add .', { stdio: 'inherit' });
        execSync('git commit -m "chore: atualiza gh-pages com conteúdo da main"', { stdio: 'inherit' });

        // 5. Push para gh-pages (com force)
        console.log('⬆️ Enviando alterações para o repositório remoto...');
        execSync('git push -f origin gh-pages', { stdio: 'inherit' });

        // 6. Volta para a branch main
        console.log('🔄 Voltando para a branch main...');
        execSync('git checkout main', { stdio: 'inherit' });

        console.log('✅ Branch gh-pages atualizada com sucesso');
    } catch (error) {
        console.error('❌ Erro ao atualizar gh-pages:', error.message);
        // Em caso de erro, volta para a branch main
        execSync('git checkout main', { stdio: 'inherit' });
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
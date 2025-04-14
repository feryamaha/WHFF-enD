/**
 * Script de Auto-Commit e Deploy
 * 
 * ESCopo e Lógica do Processo:
 * 
 * 1. INÍCIO MANUAL:
 *    - Usuário executa 'yarn build' manualmente no terminal
 *    - Isso gera um novo bundle na pasta 'dist'
 * 
 * 2. PROCESSO AUTOMÁTICO:
 *    - Script detecta o novo bundle gerado na pasta 'dist'
 *    - Inicia o servidor de desenvolvimento (yarn dev)
 *    - Aguarda 30 segundos para verificação manual da página de teste
 *    - Se não houver interrupção manual (Ctrl+C), prossegue com:
 *      * Cria commit com o nome do bundle detectado
 *      * Faz push com rebase para main
 *      * Atualiza gh-pages usando o pacote gh-pages
 * 
 * 3. ESTADO FINAL:
 *    - Servidor de desenvolvimento continua rodando
 *    - Alterações são commitadas e enviadas para o repositório
 *    - Branch gh-pages é atualizada automaticamente
 * 
 * OBSERVAÇÕES IMPORTANTES:
 * - O push usa --rebase para manter o histórico limpo
 * - O usuário tem 30 segundos para verificar a página de teste
 * - Se encontrar problemas, interrompa manualmente com Ctrl+C
 * - O servidor continua rodando até ser interrompido manualmente
 */

const fs = require('fs');
const { execSync, spawn } = require('child_process');
const path = require('path');

// Função para encontrar o arquivo bundle mais recente
function findLatestBundle() {
    const distDir = path.join(__dirname, '../dist');

    if (!fs.existsSync(distDir)) {
        console.error('❌ Diretório dist não encontrado. Execute YARN BUILD primeiro.');
        return null;
    }

    const files = fs.readdirSync(distDir);
    const bundleFiles = files.filter(file =>
        file.startsWith('bundle') && file.endsWith('.js')
    );

    if (bundleFiles.length === 0) {
        console.error('❌ Nenhum arquivo bundle encontrado na pasta dist');
        return null;
    }

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

// Função para iniciar o servidor de desenvolvimento
async function startDevServer() {
    return new Promise((resolve, reject) => {
        console.log('🚀 Iniciando servidor de desenvolvimento...');

        try {
            const dev = spawn('yarn', ['dev'], {
                stdio: 'inherit',
                shell: true,
                windowsHide: false
            });

            dev.on('error', (error) => {
                console.error('❌ Erro ao iniciar servidor de desenvolvimento:', error.message);
                reject(error);
            });

            // Resolve imediatamente para continuar o processo
            // O servidor continuará rodando em background
            resolve();
        } catch (error) {
            console.error('❌ Erro ao iniciar servidor de desenvolvimento:', error.message);
            reject(error);
        }
    });
}

// Função para fazer o commit e atualizar o repositório
async function makeCommitAndPush(bundleName) {
    try {
        // Adiciona todas as alterações
        execSync('git add .', { stdio: 'inherit' });

        // Cria o commit com o nome do bundle
        const commitMessage = `build: novo hash/bundle gerado - ${bundleName}`;
        execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

        // Pull com rebase antes do push
        console.log('🔄 Atualizando branch local com rebase...');
        execSync('git pull --rebase origin main', { stdio: 'inherit' });

        // Push para a branch main (com rebase)
        console.log('⬆️ Enviando alterações para a branch main...');
        execSync('git push origin main', { stdio: 'inherit' });

        // Atualiza gh-pages usando o pacote gh-pages
        console.log('🚀 Atualizando gh-pages...');
        execSync('yarn gh-pages -d dist', { stdio: 'inherit' });

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

        // Inicia o servidor de desenvolvimento primeiro
        await startDevServer();

        // Aguarda 30 segundos para verificação manual
        console.log('⏱️ Aguardando 30 segundos para verificação da página de teste...');
        console.log('⚠️ Se encontrar problemas, interrompa o processo com Ctrl+C');

        // Contagem regressiva de 30 segundos
        let secondsLeft = 30;
        const countdownInterval = setInterval(() => {
            secondsLeft--;
            if (secondsLeft > 0) {
                console.log(`⏱️ Tempo restante para verificação: ${secondsLeft} segundos`);
            } else {
                clearInterval(countdownInterval);
                console.log('✅ Tempo de verificação concluído. Prosseguindo com o commit e deploy...');
            }
        }, 1000);

        // Aguarda 30 segundos
        await wait(30000);
        clearInterval(countdownInterval);

        // Faz o commit e atualiza o repositório
        await makeCommitAndPush(latestBundle);

        console.log('✅ Autocommit e atualização do gh-pages realizada com sucesso!');
        console.log('🚀 O servidor de desenvolvimento continua rodando. Para interromper, pressione Ctrl+C.');
    } catch (error) {
        console.error('❌ Erro durante o processo:', error.message);
    }
}

// Executa o script
console.log('🔄 Iniciando script de auto-commit...');
main(); 
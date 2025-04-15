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
 *      * Cria commit com o nome do bundle detectado (se houver alterações)
 *      * Faz push com rebase para main
 *      * Atualiza gh-pages usando o pacote gh-pages
 * 
 * 3. ESTADO FINAL:
 *    - Servidor de desenvolvimento continua rodando
 *    - Alterações são commitadas e enviadas para o repositório
 *    - Branch gh-pages é atualizada automaticamente
 */

const fs = require('fs');
const { execSync, spawn } = require('child_process');
const path = require('path');

// Códigos ANSI para cores
const DARK_GRAY = '\x1b[90m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

// Função para encontrar o arquivo bundle mais recente
function findLatestBundle() {
    const distDir = path.join(__dirname, '../dist');
    if (!fs.existsSync(distDir)) {
        console.error(`${RED}❌ DIRETÓRIO DIST NÃO ENCONTRADO. EXECUTE YARN BUILD PRIMEIRO.${RESET}`);
        return null;
    }

    const files = fs.readdirSync(distDir);
    const bundleFiles = files.filter(file => file.startsWith('bundle') && file.endsWith('.js'));

    if (bundleFiles.length === 0) {
        console.error(`${RED}❌ NENHUM ARQUIVO BUNDLE ENCONTRADO NA PASTA DIST${RESET}`);
        return null;
    }

    return bundleFiles.reduce((latest, current) => {
        const latestPath = path.join(distDir, latest);
        const currentPath = path.join(distDir, current);
        return fs.statSync(latestPath).mtime > fs.statSync(currentPath).mtime ? latest : current;
    });
}

// Função para iniciar o servidor de desenvolvimento
async function startDevServer() {
    return new Promise((resolve, reject) => {
        console.log(`${DARK_GRAY}🚀 Iniciando servidor de desenvolvimento...${RESET}`);

        try {
            const dev = spawn('yarn', ['dev'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true,
                windowsHide: false
            });

            dev.stdout.on('data', (data) => {
                console.log(`${DARK_GRAY}${data.toString().trim()}${RESET}`);
            });

            dev.stderr.on('data', (data) => {
                console.error(`${RED}❌ ${data.toString().trim()}${RESET}`);
            });

            dev.on('error', (error) => {
                console.error(`${RED}❌ ERRO AO INICIAR SERVIDOR DE DESENVOLVIMENTO: ${error.message.toUpperCase()}${RESET}`);
                reject(error);
            });

            resolve();
        } catch (error) {
            console.error(`${RED}❌ ERRO AO INICIAR SERVIDOR DE DESENVOLVIMENTO: ${error.message.toUpperCase()}${RESET}`);
            reject(error);
        }
    });
}

// Função para fazer o commit e atualizar o repositório
async function makeCommitAndPush(bundleName) {
    try {
        // Adiciona todas as alterações
        execSync('git add .', { stdio: 'inherit' });

        // Verifica se há alterações para commitar
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        if (status.trim().length > 0) {
            // Cria o commit com o nome do bundle
            const commitMessage = `build: novo hash/bundle gerado - ${bundleName}`;
            execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
        } else {
            console.log(`${DARK_GRAY}🔄 Nenhuma alteração para commitar. Prosseguindo com rebase e deploy...${RESET}`);
        }

        // Tenta atualizar a branch local com rebase
        console.log(`${DARK_GRAY}🔄 Tentando atualizar branch local com rebase...${RESET}`);
        try {
            execSync('git pull --rebase origin main', { stdio: 'inherit' });
            execSync('git push origin main', { stdio: 'inherit' });
        } catch (rebaseError) {
            console.error(`${RED}❌ FALHA AO EXECUTAR GIT PULL --REBASE ORIGIN MAIN${RESET}`);
            console.error(`${RED}❌ CAUSA DO ERRO: CONFLITO DETECTADO DURANTE O REBASE${RESET}`);
            
            execSync('git rebase --abort', { stdio: 'inherit' });
            execSync('git push origin main --force', { stdio: 'inherit' });
        }

        // Atualiza gh-pages
        console.log(`${DARK_GRAY}🚀 Atualizando gh-pages...${RESET}`);
        execSync('yarn gh-pages -d dist', { stdio: 'inherit' });

        console.log(`${GREEN}✅ Processo realizado com sucesso para o bundle: ${bundleName}${RESET}`);
    } catch (error) {
        console.error(`${RED}❌ ERRO DURANTE O PROCESSO: ${error.message.toUpperCase()}${RESET}`);
        throw error;
    }
}

// Função principal
async function main() {
    try {
        // 1. Encontra o bundle mais recente
        console.log(`${DARK_GRAY}🔍 Procurando bundle mais recente...${RESET}`);
        const latestBundle = findLatestBundle();
        if (!latestBundle) {
            throw new Error('Nenhum arquivo bundle encontrado na pasta dist');
        }

        // 2. Inicia o servidor de desenvolvimento
        await startDevServer();

        // 3. Aguarda 30 segundos para verificação manual
        console.log(`${DARK_GRAY}⏳ Aguardando 30 segundos para verificação manual...${RESET}`);
        console.log(`${DARK_GRAY}⚠️ Pressione Ctrl+C se encontrar problemas${RESET}`);
        await new Promise(resolve => setTimeout(resolve, 30000));

        // 4. Faz o commit e atualiza o repositório
        console.log(`${DARK_GRAY}📝 Preparando auto-commit...${RESET}`);
        await makeCommitAndPush(latestBundle);

        console.log(`${GREEN}✅ Processo concluído com sucesso!${RESET}`);
        console.log(`${BLUE}🚀 Projeto buildado, deployado e atualizado.${RESET}`);

    } catch (error) {
        console.error(`${RED}❌ ERRO DURANTE O PROCESSO: ${error.message.toUpperCase()}${RESET}`);
        process.exit(1);
    }
}

// Executa o script
console.log(`${DARK_GRAY}🔄 Iniciando processo de build e deploy...${RESET}`);
main();
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

// Códigos ANSI para cores
const DARK_GRAY = '\x1b[90m'; // Cinza escuro
const RED = '\x1b[31m'; // Vermelho
const GREEN = '\x1b[32m'; // Verde
const RESET = '\x1b[0m'; // Reseta a formatação

// Função para encontrar o arquivo bundle mais recente
function findLatestBundle() {
    const distDir = path.join(__dirname, '../dist');

    if (!fs.existsSync(distDir)) {
        console.error(`${RED}❌ DIRETÓRIO DIST NÃO ENCONTRADO. EXECUTE YARN BUILD PRIMEIRO.${RESET}`);
        return null;
    }

    const files = fs.readdirSync(distDir);
    const bundleFiles = files.filter(file =>
        file.startsWith('bundle') && file.endsWith('.js')
    );

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

// Função para esperar um tempo específico
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para iniciar o servidor de desenvolvimento
async function startDevServer() {
    return new Promise((resolve, reject) => {
        console.log(`${DARK_GRAY}🚀 Iniciando servidor de desenvolvimento...${RESET}`);

        try {
            const dev = spawn('yarn', ['dev'], {
                stdio: 'inherit',
                shell: true,
                windowsHide: false
            });

            dev.on('error', (error) => {
                console.error(`${RED}❌ ERRO AO INICIAR SERVIDOR DE DESENVOLVIMENTO: ${error.message.toUpperCase()}${RESET}`);
                reject(error);
            });

            // Resolve imediatamente para continuar o processo
            // O servidor continuará rodando em background
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

        // Cria o commit com o nome do bundle
        const commitMessage = `build: novo hash/bundle gerado - ${bundleName}`;
        execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

        // Tenta atualizar a branch local com rebase
        console.log(`${DARK_GRAY}🔄 Tentando atualizar branch local com rebase...${RESET}`);
        try {
            execSync('git pull --rebase origin main', { stdio: 'inherit' });

            // Se o rebase for bem-sucedido, faz o push normalmente
            console.log(`${DARK_GRAY}⬆️ Enviando alterações para a branch main...${RESET}`);
            execSync('git push origin main', { stdio: 'inherit' });
        } catch (rebaseError) {
            // Exibe a mensagem de erro em vermelho, caixa alta, com ícone
            console.error(`${RED}❌ FALHA AO EXECUTAR GIT PULL --REBASE ORIGIN MAIN${RESET}`);
            console.error(`${RED}❌ CAUSA DO ERRO: CONFLITO DETECTADO DURANTE O REBASE, PROVAVELMENTE DEVIDO A ALTERAÇÕES CONCORRENTES NOS ARQUIVOS GERADOS NA PASTA DIST (COMO BUNDLE.JS OU INDEX.HTML).${RESET}`);

            // Aborta o rebase para limpar o estado
            console.log(`${DARK_GRAY}🔄 Abortando o rebase...${RESET}`);
            execSync('git rebase --abort', { stdio: 'inherit' });

            // Usa o push forçado como fallback
            console.log(`${DARK_GRAY}⬆️ Usando git push --force como fallback para resolver o conflito...${RESET}`);
            execSync('git push origin main --force', { stdio: 'inherit' });
        }

        // Atualiza gh-pages usando o pacote gh-pages
        console.log(`${DARK_GRAY}🚀 Atualizando gh-pages...${RESET}`);
        execSync('yarn gh-pages -d dist', { stdio: 'inherit' });

        console.log(`${GREEN}✅ Processo realizado com sucesso para o bundle: ${bundleName}${RESET}`);
    } catch (error) {
        // Exibe qualquer outro erro genérico também em vermelho, caixa alta, com ícone
        console.error(`${RED}❌ ERRO DURANTE O PROCESSO: ${error.message.toUpperCase()}${RESET}`);
    }
}

// Função principal
async function main() {
    try {
        console.log(`${DARK_GRAY}🔍 Verificando novo bundle...${RESET}`);

        // Encontra o novo bundle gerado
        const latestBundle = findLatestBundle();
        if (!latestBundle) {
            console.log(`${DARK_GRAY}❌ Nenhum arquivo bundle encontrado na pasta dist${RESET}`);
            return;
        }

        console.log(`${DARK_GRAY}📦 Bundle encontrado: ${latestBundle}${RESET}`);

        // Inicia o servidor de desenvolvimento primeiro
        await startDevServer();

        // Aguarda 30 segundos para verificação manual
        console.log(`${DARK_GRAY}⏱️ Aguardando 30 segundos para verificação da página de teste...${RESET}`);
        console.log(`${DARK_GRAY}⚠️ Se encontrar problemas, interrompa o processo com Ctrl+C${RESET}`);

        // Contagem regressiva de 30 segundos
        let secondsLeft = 30;
        const countdownInterval = setInterval(() => {
            secondsLeft--;
            if (secondsLeft > 0) {
                console.log(`${DARK_GRAY}⏱️ Tempo restante para verificação: ${secondsLeft} segundos${RESET}`);
            } else {
                clearInterval(countdownInterval);
                console.log(`${GREEN}✅ Tempo de verificação concluído. Prosseguindo com o commit e deploy...${RESET}`);
            }
        }, 1000);

        // Aguarda 30 segundos
        await wait(30000);
        clearInterval(countdownInterval);

        // Faz o commit e atualiza o repositório
        await makeCommitAndPush(latestBundle);

        console.log(`${GREEN}✅ Autocommit e atualização do gh-pages realizada com sucesso!${RESET}`);
        console.log(`${DARK_GRAY}🚀 O servidor de desenvolvimento continua rodando. Para interromper, pressione Ctrl+C${RESET}`);
    } catch (error) {
        console.error(`${RED}❌ ERRO DURANTE O PROCESSO: ${error.message.toUpperCase()}${RESET}`);
    }
}

// Executa o script
console.log(`${DARK_GRAY}🔄 Iniciando script de auto-commit...${RESET}`);
main(); 
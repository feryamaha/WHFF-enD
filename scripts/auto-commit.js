/**
 * # Auto-Commit Script - WHFF-enD
 * 
 * Este script automatiza o processo de build, verificação e deploy do projeto.
 * 
 * ## Fluxo do Algoritmo
 * 
 * 1. **Build Inicial**
 *    - Executa `yarn build` para gerar o bundle
 *    - Detecta o bundle mais recente na pasta `dist/`
 *    - Configura ambiente para produção
 * 
 * 2. **Verificação Manual**
 *    - Inicia servidor de desenvolvimento
 *    - Contagem regressiva de 30 segundos
 *    - Durante a contagem, verifique:
 *      - Página abriu corretamente
 *      - Componentes carregados
 *      - Sem erros no console
 *    - Opção de interromper com Ctrl+C se houver problemas
 * 
 * 3. **Processo Automático**
 *    - Se verificação for bem sucedida:
 *      - Commit com hash do bundle
 *      - Rebase da branch local
 *      - Push para branch main
 *      - Deploy automático para gh-pages
 * 
 * 4. **Estado Final**
 *    - Servidor de desenvolvimento permanece ativo
 *    - Mensagem de confirmação em azul
 *    - Opção de interromper com Ctrl+C quando necessário
 * 
 * ## Logs e Feedback
 * 
 * - Logs coloridos para diferentes tipos de mensagem
 * - Contagem regressiva clara
 * - Mensagens de sucesso/erro em cores distintas
 * - Instruções claras durante o processo
 * 
 * ## Interrupção do Processo
 * 
 * - Pressione Ctrl+C a qualquer momento para interromper
 * - Útil se encontrar problemas durante a verificação
 * - Mantém o ambiente limpo para nova tentativa
 * 
 * ## Requisitos
 * 
 * - Node.js >= 18.12.0
 * - Yarn como gerenciador de pacotes
 * - Git configurado com credenciais
 * - Acesso ao repositório remoto
 */

const fs = require('fs');
const { execSync, spawn } = require('child_process');
const path = require('path');

// Códigos ANSI para cores
const DARK_GRAY = '\x1b[90m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

// Função para encontrar o arquivo bundle mais recente
function findLatestBundle() {
    console.log(`${DARK_GRAY}🔍 Procurando bundle mais recente em dist/...${RESET}`);
    
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

    const latestBundle = bundleFiles.reduce((latest, current) => {
        const latestPath = path.join(distDir, latest);
        const currentPath = path.join(distDir, current);
        return fs.statSync(latestPath).mtime > fs.statSync(currentPath).mtime ? latest : current;
    });

    console.log(`${GREEN}✅ Bundle encontrado: ${latestBundle}${RESET}`);
    return latestBundle;
}

// Função para iniciar o servidor de desenvolvimento
async function startDevServer() {
    return new Promise((resolve, reject) => {
        console.log(`${DARK_GRAY}🚀 Iniciando servidor de desenvolvimento em localhost:3000...${RESET}`);

        try {
            const dev = spawn('yarn', ['dev'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true,
                windowsHide: false
            });

            dev.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output.includes('webpack compiled successfully')) {
                    console.log(`${GREEN}✅ Servidor iniciado. Abrindo navegador...${RESET}`);
                }
                console.log(`${DARK_GRAY}${output}${RESET}`);
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
        console.log(`${DARK_GRAY}📝 Verificando alterações para commit...${RESET}`);
        
        // Adiciona todas as alterações
        execSync('git add .', { stdio: 'inherit' });

        // Verifica se há alterações para commitar
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        if (status.trim().length > 0) {
            console.log(`${GREEN}✅ Alterações encontradas. Criando commit...${RESET}`);
            // Cria o commit com o nome do bundle
            const commitMessage = `build: novo hash/bundle gerado - ${bundleName}`;
            execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
        } else {
            console.log(`${BLUE}ℹ️ Nenhuma alteração para commitar${RESET}`);
        }

        // Tenta atualizar a branch local com rebase
        console.log(`${DARK_GRAY}🔄 Atualizando branch local...${RESET}`);
        try {
            execSync('git pull --rebase origin main', { stdio: 'inherit' });
            execSync('git push origin main', { stdio: 'inherit' });
            console.log(`${GREEN}✅ Branch local atualizada${RESET}`);
        } catch (rebaseError) {
            console.error(`${RED}❌ FALHA AO EXECUTAR GIT PULL --REBASE ORIGIN MAIN${RESET}`);
            console.error(`${RED}❌ CAUSA DO ERRO: CONFLITO DETECTADO DURANTE O REBASE${RESET}`);
            
            execSync('git rebase --abort', { stdio: 'inherit' });
            execSync('git push origin main --force', { stdio: 'inherit' });
        }

        // Atualiza gh-pages
        console.log(`${DARK_GRAY}🚀 Iniciando deploy para gh-pages...${RESET}`);
        execSync('yarn gh-pages -d dist', { stdio: 'inherit' });
        console.log(`${GREEN}✅ Deploy concluído com sucesso${RESET}`);

        console.log(`${GREEN}✅ Processo realizado com sucesso para o bundle: ${bundleName}${RESET}`);
    } catch (error) {
        console.error(`${RED}❌ ERRO DURANTE O PROCESSO: ${error.message.toUpperCase()}${RESET}`);
        throw error;
    }
}

// Função para contagem regressiva
async function countdown() {
    console.log(`${BLUE}⏳ Iniciando contagem regressiva para verificação manual...${RESET}`);
    console.log(`${YELLOW}⚠️ Verifique se:${RESET}`);
    console.log(`${YELLOW}  - A página abriu corretamente${RESET}`);
    console.log(`${YELLOW}  - Todos os componentes carregaram${RESET}`);
    console.log(`${YELLOW}  - Não há erros no console do navegador${RESET}`);
    console.log(`${YELLOW}  - Pressione Ctrl+C se encontrar problemas${RESET}`);
    
    for (let i = 30; i > 0; i--) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`${BLUE}⏳ ${i.toString().padStart(2, '0')} segundos restantes...${RESET}`);
    }
    
    console.log(`${GREEN}✅ Verificação manual concluída. Iniciando processo final...${RESET}`);
}

// Função principal
async function main() {
    try {
        console.log(`${BLUE}🔄 Iniciando processo de build e deploy...${RESET}`);
        console.log(`${BLUE}═══════════════════════════════════════${RESET}`);
        
        // 1. Encontra o bundle mais recente
        const latestBundle = findLatestBundle();
        if (!latestBundle) {
            throw new Error('Nenhum arquivo bundle encontrado na pasta dist');
        }

        // 2. Inicia o servidor de desenvolvimento
        await startDevServer();

        // 3. Aguarda 30 segundos com contagem regressiva
        await countdown();

        // 4. Faz o commit e atualiza o repositório
        await makeCommitAndPush(latestBundle);

        console.log(`${BLUE}═══════════════════════════════════════${RESET}`);
        console.log(`${GREEN}✅ Processo concluído com sucesso!${RESET}`);
        console.log(`${BLUE}🚀 Projeto buildado, deployado e atualizado.${RESET}`);
        console.log(`${BLUE}═══════════════════════════════════════${RESET}`);
        console.log(`${BLUE}AMBIENTE DE DESENVOLVIMENTO LOCALHOST ATIVO${RESET}`);
        console.log(`${YELLOW}Para pausar ative "ctrl + C"${RESET}`);
        console.log(`${BLUE}═══════════════════════════════════════${RESET}`);

    } catch (error) {
        console.error(`${RED}❌ ERRO DURANTE O PROCESSO: ${error.message.toUpperCase()}${RESET}`);
        process.exit(1);
    }
}

// Executa o script
main();
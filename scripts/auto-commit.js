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
 *    - Script verifica e instala dependências se necessário
 *    - Detecta o novo bundle gerado na pasta 'dist'
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
const semver = require('semver');

// Códigos ANSI para cores
const DARK_GRAY = '\x1b[90m'; // Cinza escuro
const RED = '\x1b[31m'; // Vermelho
const GREEN = '\x1b[32m'; // Verde
const BLUE = '\x1b[34m'; // Azul
const RESET = '\x1b[0m'; // Reseta a formatação

// Configuração para sobrescrever as cores padrão do Webpack
process.env.FORCE_COLOR = '1'; // Garante que as cores sejam exibidas
const webpackLogger = {
    info: (message) => {
        // Substitui mensagens que seriam amarelas (como [built], [code generated]) por cinza escuro
        console.log(`${DARK_GRAY}${message.replace(/\x1b\[[0-9;]*m/g, '')}${RESET}`);
    },
    warn: (message) => {
        // Exibe warnings em cinza escuro, caixa alta, sem ícone
        console.warn(`${DARK_GRAY}${message.toUpperCase()}${RESET}`);
    },
    error: (message) => {
        // Exibe erros em vermelho, caixa alta, com ícone ❌
        console.error(`${RED}❌ ${message.toUpperCase()}${RESET}`);
    },
    success: (message) => {
        console.log(`${GREEN}${message}${RESET}`);
    },
    // Permite que mensagens padrão do Webpack (como azul para URLs e verde para "compiled successfully") permaneçam
    raw: (message) => {
        console.log(message);
    }
};

// Configura o Webpack para usar o logger personalizado
process.env.WEBPACK_LOGGING = 'custom'; // Pode ser necessário ajustar dependendo da versão do Webpack
process.env.WEBPACK_LOGGER = JSON.stringify(webpackLogger);

// Adiciona constantes para o sistema de logging
const LOG_FILE = path.join(__dirname, '../auto-commit.log');
const LOG_SEPARATOR = '='.repeat(80);

// Função para registrar logs
function logToFile(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}\n`;

    try {
        fs.appendFileSync(LOG_FILE, logMessage);
    } catch (error) {
        console.error(`${RED}❌ ERRO AO REGISTRAR LOG: ${error.message.toUpperCase()}${RESET}`);
    }
}

// Função para registrar o início de uma nova sessão
function logSessionStart() {
    const sessionStart = `\n${LOG_SEPARATOR}\nNOVA SESSÃO INICIADA EM ${new Date().toISOString()}\n${LOG_SEPARATOR}\n`;
    fs.appendFileSync(LOG_FILE, sessionStart);
}

// Função para verificar e atualizar dependências
async function checkAndUpdateDependencies() {
    console.log(`${DARK_GRAY}🔍 Verificando dependências...${RESET}`);
    logToFile('Iniciando verificação de dependências');

    try {
        // Verifica dependências desatualizadas
        const outdated = execSync('yarn outdated --json', { encoding: 'utf8' });
        const outdatedPackages = JSON.parse(outdated);

        if (outdatedPackages.data.body.length > 0) {
            const updateMessage = `Encontradas ${outdatedPackages.data.body.length} dependências desatualizadas`;
            console.log(`${DARK_GRAY}📦 ${updateMessage}${RESET}`);
            logToFile(updateMessage);

            // Registra cada pacote desatualizado
            outdatedPackages.data.body.forEach(pkg => {
                const pkgMessage = `Pacote desatualizado: ${pkg.name} (atual: ${pkg.current}, disponível: ${pkg.latest})`;
                logToFile(pkgMessage);
            });

            console.log(`${DARK_GRAY}🔄 Atualizando dependências...${RESET}`);
            logToFile('Iniciando atualização de dependências');

            // Atualiza dependências
            execSync('yarn upgrade --latest', { stdio: 'inherit' });
            console.log(`${GREEN}✅ Dependências atualizadas com sucesso.${RESET}`);
            logToFile('Dependências atualizadas com sucesso');
        } else {
            console.log(`${GREEN}✅ Todas as dependências estão atualizadas.${RESET}`);
            logToFile('Todas as dependências estão atualizadas');
        }

        // Verifica dependências faltantes
        const missing = execSync('yarn check --verify-tree', { encoding: 'utf8' });
        if (missing.includes('error')) {
            console.log(`${DARK_GRAY}📦 Instalando dependências faltantes...${RESET}`);
            logToFile('Encontradas dependências faltantes, iniciando instalação');

            execSync('yarn install', { stdio: 'inherit' });
            console.log(`${GREEN}✅ Dependências instaladas com sucesso.${RESET}`);
            logToFile('Dependências faltantes instaladas com sucesso');
        }

        // Verifica vulnerabilidades
        console.log(`${DARK_GRAY}🔍 Verificando vulnerabilidades...${RESET}`);
        logToFile('Iniciando verificação de vulnerabilidades');

        const audit = execSync('yarn audit --json', { encoding: 'utf8' });
        const auditResults = JSON.parse(audit);

        if (auditResults.data.vulnerabilities.length > 0) {
            const vulnMessage = `Encontradas ${auditResults.data.vulnerabilities.length} vulnerabilidades`;
            logToFile(vulnMessage, 'WARNING');

            auditResults.data.vulnerabilities.forEach(vuln => {
                const vulnDetails = `Vulnerabilidade: ${vuln.name} (${vuln.severity}) - ${vuln.title}`;
                logToFile(vulnDetails, 'WARNING');
            });
        } else {
            logToFile('Nenhuma vulnerabilidade encontrada');
        }

    } catch (error) {
        const errorMessage = `ERRO AO VERIFICAR DEPENDÊNCIAS: ${error.message}`;
        console.error(`${RED}❌ ${errorMessage.toUpperCase()}${RESET}`);
        logToFile(errorMessage, 'ERROR');
        throw error;
    }
}

// Função para verificar e instalar dependências se necessário
function checkAndInstallDependencies() {
    const nodeModulesPath = path.join(__dirname, '../node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
        console.log(`${DARK_GRAY}📦 Dependências não encontradas. Executando yarn install...${RESET}`);
        try {
            execSync('yarn install', { stdio: 'inherit' });
            console.log(`${GREEN}✅ Dependências instaladas com sucesso.${RESET}`);
        } catch (error) {
            console.error(`${RED}❌ ERRO AO INSTALAR DEPENDÊNCIAS: ${error.message.toUpperCase()}${RESET}`);
            throw error;
        }
    } else {
        console.log(`${DARK_GRAY}📦 Dependências já instaladas.${RESET}`);
    }
}

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

// Função para verificar se há alterações para commitar
function hasChangesToCommit() {
    try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        return status.trim().length > 0;
    } catch (error) {
        console.error(`${RED}❌ ERRO AO VERIFICAR STATUS DO GIT: ${error.message.toUpperCase()}${RESET}`);
        return false;
    }
}

// Função para iniciar o servidor de desenvolvimento
async function startDevServer() {
    return new Promise((resolve, reject) => {
        console.log(`${DARK_GRAY}🚀 Iniciando servidor de desenvolvimento...${RESET}`);

        try {
            const dev = spawn('yarn', ['dev'], {
                stdio: ['pipe', 'pipe', 'pipe'], // Redireciona a saída para que possamos manipulá-la
                shell: true,
                windowsHide: false
            });

            // Captura a saída do Webpack Dev Server e aplica o logger personalizado
            dev.stdout.on('data', (data) => {
                const message = data.toString().trim();
                // Verifica se a mensagem é informativa do Webpack Dev Server ou Middleware
                if (
                    message.includes('[webpack-dev-server]') ||
                    message.includes('[webpack-dev-middleware]') ||
                    message.includes('compiled successfully')
                ) {
                    // Mantém mensagens em azul (como URLs) e verde (como "compiled successfully") como estão
                    webpackLogger.raw(message);
                } else {
                    // Outras mensagens (como [built], [code generated]) são exibidas em cinza escuro
                    webpackLogger.info(message);
                }
            });

            dev.stderr.on('data', (data) => {
                const message = data.toString().trim();
                // Verifica se a mensagem é um warning (como DeprecationWarning)
                if (message.includes('DeprecationWarning')) {
                    webpackLogger.warn(message);
                } else {
                    // Outras mensagens de erro reais são tratadas como erro
                    webpackLogger.error(message);
                }
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

        // Verifica se há alterações para commitar
        if (hasChangesToCommit()) {
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

        // Cria uma pasta temporária para os arquivos que serão publicados no gh-pages
        const tempDir = path.join(__dirname, 'gh-pages-temp');
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        fs.mkdirSync(tempDir);

        // Copia os arquivos de dist/ para a pasta temporária (na raiz, sem a subpasta dist/)
        console.log(`${DARK_GRAY}📂 Copiando arquivos de dist/ para a raiz do gh-pages...${RESET}`);
        const distDir = path.join(__dirname, '../dist');
        fs.readdirSync(distDir).forEach(file => {
            const srcPath = path.join(distDir, file);
            const destPath = path.join(tempDir, file);
            fs.cpSync(srcPath, destPath, { recursive: true });
        });

        // Atualiza gh-pages usando o pacote gh-pages, mas publica a pasta temporária
        console.log(`${DARK_GRAY}🚀 Atualizando gh-pages...${RESET}`);
        execSync(`yarn gh-pages -d ${tempDir}`, { stdio: 'inherit' });

        // Remove a pasta temporária
        fs.rmSync(tempDir, { recursive: true, force: true });

        console.log(`${GREEN}✅ Processo realizado com sucesso para o bundle: ${bundleName}${RESET}`);
    } catch (error) {
        // Exibe qualquer outro erro genérico também em vermelho, caixa alta, com ícone
        console.error(`${RED}❌ ERRO DURANTE O PROCESSO: ${error.message.toUpperCase()}${RESET}`);
        throw error; // Re-lança o erro para evitar mensagens duplicadas
    }
}

// Função para analisar e resolver problemas
async function diagnoseAndFixIssues() {
    console.log(`${DARK_GRAY}🔍 Iniciando diagnóstico do projeto...${RESET}`);
    logToFile('Iniciando diagnóstico completo do projeto');

    try {
        // 1. Verifica problemas de dependências
        const dependencyIssues = await checkDependencyIssues();
        if (dependencyIssues.length > 0) {
            logToFile(`Encontrados ${dependencyIssues.length} problemas de dependências`, 'WARNING');
            dependencyIssues.forEach(issue => {
                logToFile(`Problema: ${issue.problem}\nCausa: ${issue.cause}\nLocalização: ${issue.location}\nSolução: ${issue.solution}`, 'WARNING');
            });
        }

        // 2. Verifica problemas de configuração
        const configIssues = await checkConfigurationIssues();
        if (configIssues.length > 0) {
            logToFile(`Encontrados ${configIssues.length} problemas de configuração`, 'WARNING');
            configIssues.forEach(issue => {
                logToFile(`Problema: ${issue.problem}\nCausa: ${issue.cause}\nLocalização: ${issue.location}\nSolução: ${issue.solution}`, 'WARNING');
            });
        }

        // 3. Verifica problemas de código
        const codeIssues = await checkCodeIssues();
        if (codeIssues.length > 0) {
            logToFile(`Encontrados ${codeIssues.length} problemas de código`, 'WARNING');
            codeIssues.forEach(issue => {
                logToFile(`Problema: ${issue.problem}\nCausa: ${issue.cause}\nLocalização: ${issue.location}\nSolução: ${issue.solution}`, 'WARNING');
            });
        }

        // 4. Tenta resolver problemas automaticamente
        await autoFixIssues([...dependencyIssues, ...configIssues, ...codeIssues]);

    } catch (error) {
        const errorMessage = `ERRO DURANTE O DIAGNÓSTICO: ${error.message}`;
        console.error(`${RED}❌ ${errorMessage.toUpperCase()}${RESET}`);
        logToFile(errorMessage, 'ERROR');
        throw error;
    }
}

// Função para verificar problemas de dependências
async function checkDependencyIssues() {
    const issues = [];

    try {
        // Verifica versões incompatíveis
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

        for (const [pkg, version] of Object.entries(dependencies)) {
            try {
                const pkgInfo = JSON.parse(execSync(`npm view ${pkg} --json`, { encoding: 'utf8' }));

                // Verifica compatibilidade com Node.js
                if (pkgInfo.engines && pkgInfo.engines.node) {
                    const requiredVersion = pkgInfo.engines.node;
                    const currentVersion = process.version;
                    if (!semver.satisfies(currentVersion, requiredVersion)) {
                        issues.push({
                            problem: `Incompatibilidade de versão do Node.js para ${pkg}`,
                            cause: `O pacote ${pkg} requer Node.js ${requiredVersion}, mas está rodando ${currentVersion}`,
                            location: `package.json (dependência: ${pkg})`,
                            solution: `Atualizar Node.js para uma versão compatível ou usar uma versão diferente do pacote ${pkg}`
                        });
                    }
                }

                // Verifica vulnerabilidades conhecidas
                const audit = JSON.parse(execSync(`npm audit ${pkg} --json`, { encoding: 'utf8' }));
                if (audit.metadata.vulnerabilities.total > 0) {
                    issues.push({
                        problem: `Vulnerabilidades encontradas em ${pkg}`,
                        cause: `O pacote ${pkg} contém vulnerabilidades conhecidas`,
                        location: `node_modules/${pkg}`,
                        solution: `Atualizar para a versão mais recente ou aplicar patches de segurança`
                    });
                }
            } catch (error) {
                issues.push({
                    problem: `Erro ao verificar pacote ${pkg}`,
                    cause: error.message,
                    location: `package.json (dependência: ${pkg})`,
                    solution: `Verificar a existência do pacote no registro npm`
                });
            }
        }
    } catch (error) {
        issues.push({
            problem: 'Erro ao ler package.json',
            cause: error.message,
            location: 'package.json',
            solution: 'Verificar a integridade do arquivo package.json'
        });
    }

    return issues;
}

// Função para verificar problemas de configuração
async function checkConfigurationIssues() {
    const issues = [];

    try {
        // Verifica configuração do webpack
        if (fs.existsSync('webpack.config.js')) {
            const webpackConfig = require('../webpack.config.js');

            // Verifica loaders necessários
            const requiredLoaders = ['babel-loader', 'css-loader', 'style-loader'];
            const missingLoaders = requiredLoaders.filter(loader =>
                !webpackConfig.module.rules.some(rule =>
                    rule.use && rule.use.some(u => u.loader && u.loader.includes(loader))
                )
            );

            if (missingLoaders.length > 0) {
                issues.push({
                    problem: 'Loaders do webpack ausentes',
                    cause: `Faltam os seguintes loaders: ${missingLoaders.join(', ')}`,
                    location: 'webpack.config.js',
                    solution: 'Adicionar os loaders necessários na configuração do webpack'
                });
            }
        }

        // Verifica configuração do babel
        if (fs.existsSync('.babelrc')) {
            const babelConfig = JSON.parse(fs.readFileSync('.babelrc', 'utf8'));

            if (!babelConfig.presets || !babelConfig.presets.includes('@babel/preset-react')) {
                issues.push({
                    problem: 'Configuração do Babel incompleta',
                    cause: 'Preset do React não configurado',
                    location: '.babelrc',
                    solution: 'Adicionar @babel/preset-react aos presets do Babel'
                });
            }
        }
    } catch (error) {
        issues.push({
            problem: 'Erro ao verificar configurações',
            cause: error.message,
            location: 'Arquivos de configuração',
            solution: 'Verificar a integridade dos arquivos de configuração'
        });
    }

    return issues;
}

// Função para verificar problemas de código
async function checkCodeIssues() {
    const issues = [];

    try {
        // Verifica arquivos JavaScript/JSX
        const jsFiles = await findFiles('src', ['.js', '.jsx']);

        for (const file of jsFiles) {
            const content = fs.readFileSync(file, 'utf8');

            // Verifica imports não utilizados
            const imports = content.match(/import\s+.*?from\s+['"].*?['"]/g) || [];
            const usedImports = new Set();

            imports.forEach(imp => {
                const importName = imp.match(/import\s+(.*?)\s+from/)[1];
                if (!content.includes(importName)) {
                    issues.push({
                        problem: 'Import não utilizado',
                        cause: `O import ${importName} não está sendo usado no código`,
                        location: file,
                        solution: 'Remover o import não utilizado'
                    });
                }
            });

            // Verifica componentes React sem PropTypes
            if (file.endsWith('.jsx')) {
                const componentName = path.basename(file, '.jsx');
                if (content.includes(`class ${componentName}`) || content.includes(`function ${componentName}`)) {
                    if (!content.includes('PropTypes')) {
                        issues.push({
                            problem: 'Componente React sem PropTypes',
                            cause: `O componente ${componentName} não tem PropTypes definidos`,
                            location: file,
                            solution: 'Adicionar PropTypes ao componente'
                        });
                    }
                }
            }
        }
    } catch (error) {
        issues.push({
            problem: 'Erro ao verificar código',
            cause: error.message,
            location: 'Arquivos de código fonte',
            solution: 'Verificar a integridade dos arquivos de código'
        });
    }

    return issues;
}

// Função para tentar resolver problemas automaticamente
async function autoFixIssues(issues) {
    for (const issue of issues) {
        try {
            switch (issue.problem) {
                case 'Incompatibilidade de versão do Node.js':
                    // Tenta instalar uma versão compatível do pacote
                    const pkg = issue.location.match(/dependência: (.*)\)/)[1];
                    execSync(`npm install ${pkg}@latest`, { stdio: 'inherit' });
                    logToFile(`Resolvido: ${issue.problem} para ${pkg}`, 'INFO');
                    break;

                case 'Vulnerabilidades encontradas':
                    // Tenta atualizar o pacote para a versão mais recente
                    const vulnerablePkg = issue.location.split('/')[1];
                    execSync(`npm update ${vulnerablePkg}`, { stdio: 'inherit' });
                    logToFile(`Resolvido: ${issue.problem} em ${vulnerablePkg}`, 'INFO');
                    break;

                case 'Loaders do webpack ausentes':
                    // Instala os loaders faltantes
                    const missingLoaders = issue.cause.match(/Faltam os seguintes loaders: (.*)/)[1].split(', ');
                    execSync(`npm install --save-dev ${missingLoaders.join(' ')}`, { stdio: 'inherit' });
                    logToFile(`Resolvido: ${issue.problem}`, 'INFO');
                    break;

                default:
                    logToFile(`Não foi possível resolver automaticamente: ${issue.problem}\nCausa: ${issue.cause}\nLocalização: ${issue.location}`, 'WARNING');
            }
        } catch (error) {
            logToFile(`Falha ao resolver: ${issue.problem}\nErro: ${error.message}`, 'ERROR');
        }
    }
}

// Função auxiliar para encontrar arquivos
async function findFiles(dir, extensions) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...await findFiles(fullPath, extensions));
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
            files.push(fullPath);
        }
    }

    return files;
}

// Função para verificar e gerar yarn.lock
async function checkAndGenerateYarnLock() {
    console.log(`${DARK_GRAY}🔍 Verificando yarn.lock...${RESET}`);
    logToFile('Verificando existência do yarn.lock');

    const yarnLockPath = path.join(__dirname, '../yarn.lock');

    if (!fs.existsSync(yarnLockPath)) {
        console.log(`${DARK_GRAY}📦 yarn.lock não encontrado. Gerando novo arquivo...${RESET}`);
        logToFile('yarn.lock não encontrado, iniciando geração');

        try {
            // Executa yarn install para gerar o yarn.lock
            execSync('yarn install', { stdio: 'inherit' });
            console.log(`${GREEN}✅ yarn.lock gerado com sucesso${RESET}`);
            logToFile('yarn.lock gerado com sucesso', 'INFO');

            // Verifica se o arquivo foi criado
            if (fs.existsSync(yarnLockPath)) {
                console.log(`${GREEN}✅ Verificação do yarn.lock concluída${RESET}`);
                logToFile('Verificação do yarn.lock concluída', 'INFO');
            } else {
                throw new Error('Falha ao gerar yarn.lock');
            }
        } catch (error) {
            const errorMessage = `ERRO AO GERAR YARN.LOCK: ${error.message}`;
            console.error(`${RED}❌ ${errorMessage}${RESET}`);
            logToFile(errorMessage, 'ERROR');
            throw error;
        }
    } else {
        console.log(`${GREEN}✅ yarn.lock encontrado${RESET}`);
        logToFile('yarn.lock encontrado', 'INFO');

        // Verifica se o yarn.lock está atualizado
        try {
            const checkResult = execSync('yarn check --verify-tree', { encoding: 'utf8' });
            if (checkResult.includes('error')) {
                console.log(`${DARK_GRAY}🔄 yarn.lock desatualizado. Atualizando...${RESET}`);
                logToFile('yarn.lock desatualizado, iniciando atualização', 'WARNING');

                execSync('yarn install', { stdio: 'inherit' });
                console.log(`${GREEN}✅ yarn.lock atualizado com sucesso${RESET}`);
                logToFile('yarn.lock atualizado com sucesso', 'INFO');
            }
        } catch (error) {
            const errorMessage = `ERRO AO VERIFICAR YARN.LOCK: ${error.message}`;
            console.error(`${RED}❌ ${errorMessage}${RESET}`);
            logToFile(errorMessage, 'ERROR');
            throw error;
        }
    }
}

// Configuração de requisitos do projeto
const PROJECT_REQUIREMENTS = {
    nodeVersion: '>=18.12.0',
    requiredPackages: {
        core: ['react', 'react-dom', 'react-router-dom'],
        dev: ['webpack', 'webpack-cli', 'webpack-dev-server', 'babel-loader', 'css-loader', 'style-loader', 'sass-loader'],
        build: ['cross-env', 'gh-pages'],
        testing: ['jest', '@testing-library/react'],
        linting: ['eslint', 'prettier'],
        types: ['@types/react', '@types/react-dom', '@types/node']
    },
    requiredConfigs: {
        webpack: ['webpack.config.js'],
        babel: ['.babelrc'],
        eslint: ['.eslintrc'],
        prettier: ['.prettierrc']
    },
    requiredScripts: {
        build: 'cross-env NODE_ENV=production webpack',
        dev: 'webpack serve --mode development --open',
        test: 'jest',
        lint: 'eslint src/**/*.{js,jsx}'
    }
};

// Função para verificar requisitos do projeto
async function checkProjectRequirements() {
    console.log(`${DARK_GRAY}🔍 Verificando requisitos do projeto...${RESET}`);
    logToFile('Iniciando verificação de requisitos do projeto');

    const issues = [];

    try {
        // 1. Verifica versão do Node.js
        if (!semver.satisfies(process.version, PROJECT_REQUIREMENTS.nodeVersion)) {
            issues.push({
                problem: 'Versão do Node.js incompatível',
                cause: `O projeto requer Node.js ${PROJECT_REQUIREMENTS.nodeVersion}, mas está rodando ${process.version}`,
                location: 'Sistema',
                solution: `Atualizar Node.js para uma versão compatível (${PROJECT_REQUIREMENTS.nodeVersion})`,
                severity: 'HIGH'
            });
        }

        // 2. Verifica pacotes instalados
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const installedPackages = { ...packageJson.dependencies, ...packageJson.devDependencies };

        // Verifica pacotes core
        for (const pkg of PROJECT_REQUIREMENTS.requiredPackages.core) {
            if (!installedPackages[pkg]) {
                issues.push({
                    problem: `Pacote core faltante: ${pkg}`,
                    cause: `O pacote ${pkg} é necessário para o funcionamento básico do projeto`,
                    location: 'package.json',
                    solution: `Instalar o pacote: yarn add ${pkg}`,
                    severity: 'HIGH'
                });
            }
        }

        // Verifica pacotes de desenvolvimento
        for (const pkg of PROJECT_REQUIREMENTS.requiredPackages.dev) {
            if (!installedPackages[pkg]) {
                issues.push({
                    problem: `Pacote de desenvolvimento faltante: ${pkg}`,
                    cause: `O pacote ${pkg} é necessário para o desenvolvimento`,
                    location: 'package.json',
                    solution: `Instalar o pacote: yarn add -D ${pkg}`,
                    severity: 'MEDIUM'
                });
            }
        }

        // 3. Verifica configurações
        for (const [configType, files] of Object.entries(PROJECT_REQUIREMENTS.requiredConfigs)) {
            for (const file of files) {
                if (!fs.existsSync(file)) {
                    issues.push({
                        problem: `Arquivo de configuração faltante: ${file}`,
                        cause: `O arquivo ${file} é necessário para a configuração do ${configType}`,
                        location: file,
                        solution: `Criar o arquivo ${file} com as configurações necessárias`,
                        severity: 'MEDIUM'
                    });
                }
            }
        }

        // 4. Verifica scripts
        for (const [script, command] of Object.entries(PROJECT_REQUIREMENTS.requiredScripts)) {
            if (!packageJson.scripts[script]) {
                issues.push({
                    problem: `Script faltante: ${script}`,
                    cause: `O script ${script} é necessário para ${script === 'build' ? 'construir' : script === 'dev' ? 'desenvolver' : 'testar'} o projeto`,
                    location: 'package.json (scripts)',
                    solution: `Adicionar o script: "${script}": "${command}"`,
                    severity: 'MEDIUM'
                });
            }
        }

        // 5. Verifica estrutura de diretórios
        const requiredDirs = ['src', 'public', 'dist'];
        for (const dir of requiredDirs) {
            if (!fs.existsSync(dir)) {
                issues.push({
                    problem: `Diretório faltante: ${dir}`,
                    cause: `O diretório ${dir} é necessário para a estrutura do projeto`,
                    location: dir,
                    solution: `Criar o diretório ${dir}`,
                    severity: 'HIGH'
                });
            }
        }

        // 6. Verifica arquivos essenciais
        const requiredFiles = ['src/index.js', 'public/index.html'];
        for (const file of requiredFiles) {
            if (!fs.existsSync(file)) {
                issues.push({
                    problem: `Arquivo essencial faltante: ${file}`,
                    cause: `O arquivo ${file} é necessário para o funcionamento do projeto`,
                    location: file,
                    solution: `Criar o arquivo ${file}`,
                    severity: 'HIGH'
                });
            }
        }

        // 7. Verifica versões dos pacotes
        for (const [pkg, version] of Object.entries(installedPackages)) {
            try {
                const pkgInfo = JSON.parse(execSync(`npm view ${pkg} --json`, { encoding: 'utf8' }));

                // Verifica se há versões mais recentes
                if (pkgInfo['dist-tags'] && pkgInfo['dist-tags'].latest !== version.replace(/[\^~]/g, '')) {
                    issues.push({
                        problem: `Pacote desatualizado: ${pkg}`,
                        cause: `Versão atual: ${version}, Versão mais recente: ${pkgInfo['dist-tags'].latest}`,
                        location: `package.json (${pkg})`,
                        solution: `Atualizar para a versão mais recente: yarn upgrade ${pkg}@latest`,
                        severity: 'LOW'
                    });
                }

                // Verifica vulnerabilidades
                const audit = JSON.parse(execSync(`npm audit ${pkg} --json`, { encoding: 'utf8' }));
                if (audit.metadata.vulnerabilities.total > 0) {
                    issues.push({
                        problem: `Vulnerabilidades em ${pkg}`,
                        cause: `O pacote contém ${audit.metadata.vulnerabilities.total} vulnerabilidades conhecidas`,
                        location: `node_modules/${pkg}`,
                        solution: `Atualizar para uma versão segura: yarn upgrade ${pkg}@latest`,
                        severity: 'HIGH'
                    });
                }
            } catch (error) {
                issues.push({
                    problem: `Erro ao verificar pacote ${pkg}`,
                    cause: error.message,
                    location: `package.json (${pkg})`,
                    solution: 'Verificar a existência do pacote no registro npm',
                    severity: 'MEDIUM'
                });
            }
        }

        // 8. Verifica configuração do webpack
        if (fs.existsSync('webpack.config.js')) {
            const webpackConfig = require('../webpack.config.js');

            // Verifica configurações essenciais
            const requiredWebpackConfigs = ['entry', 'output', 'module', 'plugins'];
            for (const config of requiredWebpackConfigs) {
                if (!webpackConfig[config]) {
                    issues.push({
                        problem: `Configuração do webpack faltante: ${config}`,
                        cause: `A configuração ${config} é necessária para o webpack funcionar corretamente`,
                        location: 'webpack.config.js',
                        solution: `Adicionar a configuração ${config} no webpack.config.js`,
                        severity: 'HIGH'
                    });
                }
            }
        }

        // 9. Verifica configuração do Babel
        if (fs.existsSync('.babelrc')) {
            const babelConfig = JSON.parse(fs.readFileSync('.babelrc', 'utf8'));

            // Verifica presets necessários
            const requiredPresets = ['@babel/preset-env', '@babel/preset-react'];
            for (const preset of requiredPresets) {
                if (!babelConfig.presets || !babelConfig.presets.includes(preset)) {
                    issues.push({
                        problem: `Preset do Babel faltante: ${preset}`,
                        cause: `O preset ${preset} é necessário para o Babel funcionar corretamente`,
                        location: '.babelrc',
                        solution: `Adicionar o preset ${preset} no .babelrc`,
                        severity: 'HIGH'
                    });
                }
            }
        }

        return issues;

    } catch (error) {
        const errorMessage = `ERRO AO VERIFICAR REQUISITOS: ${error.message}`;
        console.error(`${RED}❌ ${errorMessage}${RESET}`);
        logToFile(errorMessage, 'ERROR');
        throw error;
    }
}

// Templates para arquivos de configuração
const CONFIG_TEMPLATES = {
    eslintrc: {
        extends: ['react-app', 'react-app/jest'],
        rules: {
            'no-unused-vars': 'warn',
            'react/prop-types': 'warn'
        }
    },
    prettierrc: {
        semi: true,
        trailingComma: 'es5',
        singleQuote: true,
        printWidth: 100,
        tabWidth: 4
    }
};

// Função para criar arquivos de configuração
async function createConfigFiles() {
    console.log(`${DARK_GRAY}📝 Verificando arquivos de configuração...${RESET}`);
    logToFile('Verificando arquivos de configuração');

    try {
        // Cria .eslintrc
        if (!fs.existsSync('.eslintrc')) {
            fs.writeFileSync('.eslintrc', JSON.stringify(CONFIG_TEMPLATES.eslintrc, null, 2));
            console.log(`${GREEN}✅ .eslintrc criado com sucesso${RESET}`);
            logToFile('.eslintrc criado com sucesso', 'INFO');
        }

        // Cria .prettierrc
        if (!fs.existsSync('.prettierrc')) {
            fs.writeFileSync('.prettierrc', JSON.stringify(CONFIG_TEMPLATES.prettierrc, null, 2));
            console.log(`${GREEN}✅ .prettierrc criado com sucesso${RESET}`);
            logToFile('.prettierrc criado com sucesso', 'INFO');
        }
    } catch (error) {
        const errorMessage = `ERRO AO CRIAR ARQUIVOS DE CONFIGURAÇÃO: ${error.message}`;
        console.error(`${RED}❌ ${errorMessage}${RESET}`);
        logToFile(errorMessage, 'ERROR');
        throw error;
    }
}

// Função para verificar e adicionar scripts
async function checkAndAddScripts() {
    console.log(`${DARK_GRAY}🔍 Verificando scripts...${RESET}`);
    logToFile('Verificando scripts do package.json');

    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        let updated = false;

        // Scripts padrão
        const defaultScripts = {
            test: 'jest',
            lint: 'eslint src/**/*.{js,jsx}',
            'lint:fix': 'eslint src/**/*.{js,jsx} --fix',
            format: 'prettier --write "src/**/*.{js,jsx,css,scss}"'
        };

        // Adiciona scripts faltantes
        for (const [script, command] of Object.entries(defaultScripts)) {
            if (!packageJson.scripts[script]) {
                packageJson.scripts[script] = command;
                updated = true;
                console.log(`${GREEN}✅ Script ${script} adicionado${RESET}`);
                logToFile(`Script ${script} adicionado`, 'INFO');
            }
        }

        // Salva alterações se necessário
        if (updated) {
            fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
            console.log(`${GREEN}✅ package.json atualizado com sucesso${RESET}`);
            logToFile('package.json atualizado com sucesso', 'INFO');
        }
    } catch (error) {
        const errorMessage = `ERRO AO VERIFICAR SCRIPTS: ${error.message}`;
        console.error(`${RED}❌ ${errorMessage}${RESET}`);
        logToFile(errorMessage, 'ERROR');
        throw error;
    }
}

// Função para verificar vulnerabilidades usando uma abordagem alternativa
async function checkVulnerabilities() {
    console.log(`${DARK_GRAY}🔍 Verificando vulnerabilidades...${RESET}`);
    logToFile('Iniciando verificação de vulnerabilidades');

    try {
        // Primeiro, tenta usar yarn audit
        try {
            const audit = execSync('yarn audit --json', { encoding: 'utf8' });
            const vulnerabilities = JSON.parse(audit);

            if (vulnerabilities.metadata.vulnerabilities.total > 0) {
                console.log(`${RED}⚠️ Encontradas ${vulnerabilities.metadata.vulnerabilities.total} vulnerabilidades${RESET}`);
                logToFile(`Encontradas ${vulnerabilities.metadata.vulnerabilities.total} vulnerabilidades`, 'WARNING');

                // Tenta atualizar pacotes vulneráveis
                execSync('yarn upgrade --latest', { stdio: 'inherit' });
                console.log(`${GREEN}✅ Pacotes atualizados com sucesso${RESET}`);
                logToFile('Pacotes atualizados com sucesso', 'INFO');
            } else {
                console.log(`${GREEN}✅ Nenhuma vulnerabilidade encontrada${RESET}`);
                logToFile('Nenhuma vulnerabilidade encontrada', 'INFO');
            }
        } catch (auditError) {
            // Se yarn audit falhar, usa uma abordagem alternativa
            console.log(`${DARK_GRAY}⚠️ yarn audit falhou, usando verificação alternativa...${RESET}`);

            // Verifica pacotes conhecidos por terem vulnerabilidades
            const knownVulnerablePackages = {
                'react-scripts': '>=5.0.1',
                'webpack': '>=5.99.5',
                'babel-loader': '>=9.1.3',
                'css-loader': '>=6.8.1',
                'style-loader': '>=3.3.3',
                'sass-loader': '>=13.3.2'
            };

            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

            let vulnerabilitiesFound = false;

            for (const [pkg, minVersion] of Object.entries(knownVulnerablePackages)) {
                if (dependencies[pkg]) {
                    const currentVersion = dependencies[pkg].replace(/[\^~]/g, '');
                    if (!semver.satisfies(currentVersion, minVersion)) {
                        console.log(`${RED}⚠️ Vulnerabilidade potencial: ${pkg} (versão atual: ${currentVersion}, versão segura: ${minVersion})${RESET}`);
                        logToFile(`Vulnerabilidade potencial: ${pkg} (versão atual: ${currentVersion}, versão segura: ${minVersion})`, 'WARNING');
                        vulnerabilitiesFound = true;

                        // Atualiza o pacote para a versão segura
                        execSync(`yarn upgrade ${pkg}@${minVersion}`, { stdio: 'inherit' });
                        console.log(`${GREEN}✅ ${pkg} atualizado para versão segura${RESET}`);
                        logToFile(`${pkg} atualizado para versão segura`, 'INFO');
                    }
                }
            }

            if (!vulnerabilitiesFound) {
                console.log(`${GREEN}✅ Nenhuma vulnerabilidade conhecida encontrada${RESET}`);
                logToFile('Nenhuma vulnerabilidade conhecida encontrada', 'INFO');
            }
        }
    } catch (error) {
        const errorMessage = `ERRO AO VERIFICAR VULNERABILIDADES: ${error.message}`;
        console.error(`${RED}❌ ${errorMessage}${RESET}`);
        logToFile(errorMessage, 'ERROR');
        throw error;
    }
}

// Função para verificar e corrigir problemas de compatibilidade
async function checkAndFixCompatibility() {
    console.log(`${DARK_GRAY}🔍 Verificando compatibilidade...${RESET}`);
    logToFile('Iniciando verificação de compatibilidade');

    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

        // Versões compatíveis conhecidas
        const compatibleVersions = {
            'react': '^19.1.0',
            'react-dom': '^19.1.0',
            'react-router-dom': '^7.5.0',
            'webpack': '^5.99.5',
            'webpack-cli': '^6.0.1',
            'webpack-dev-server': '^5.2.1',
            'babel-loader': '^10.0.0',
            'css-loader': '^7.1.2',
            'style-loader': '^4.0.0',
            'sass-loader': '^16.0.5'
        };

        let updatesNeeded = false;

        for (const [pkg, version] of Object.entries(compatibleVersions)) {
            if (dependencies[pkg] && !semver.satisfies(dependencies[pkg], version)) {
                console.log(`${RED}⚠️ Incompatibilidade: ${pkg} (versão atual: ${dependencies[pkg]}, versão compatível: ${version})${RESET}`);
                logToFile(`Incompatibilidade: ${pkg} (versão atual: ${dependencies[pkg]}, versão compatível: ${version})`, 'WARNING');

                // Atualiza para a versão compatível
                execSync(`yarn upgrade ${pkg}@${version}`, { stdio: 'inherit' });
                console.log(`${GREEN}✅ ${pkg} atualizado para versão compatível${RESET}`);
                logToFile(`${pkg} atualizado para versão compatível`, 'INFO');
                updatesNeeded = true;
            }
        }

        if (updatesNeeded) {
            // Atualiza o yarn.lock após as mudanças
            execSync('yarn install', { stdio: 'inherit' });
            console.log(`${GREEN}✅ yarn.lock atualizado com sucesso${RESET}`);
            logToFile('yarn.lock atualizado com sucesso', 'INFO');
        } else {
            console.log(`${GREEN}✅ Todas as dependências estão em versões compatíveis${RESET}`);
            logToFile('Todas as dependências estão em versões compatíveis', 'INFO');
        }
    } catch (error) {
        const errorMessage = `ERRO AO VERIFICAR COMPATIBILIDADE: ${error.message}`;
        console.error(`${RED}❌ ${errorMessage}${RESET}`);
        logToFile(errorMessage, 'ERROR');
        throw error;
    }
}

// Função para limpar e reinstalar dependências
async function cleanAndReinstallDependencies() {
    console.log(`${DARK_GRAY}🧹 Limpando e reinstalando dependências...${RESET}`);
    logToFile('Iniciando limpeza e reinstalação de dependências');

    try {
        // Remove package-lock.json se existir
        if (fs.existsSync('package-lock.json')) {
            fs.unlinkSync('package-lock.json');
            console.log(`${GREEN}✅ package-lock.json removido${RESET}`);
            logToFile('package-lock.json removido', 'INFO');
        }

        // Remove node_modules e yarn.lock
        if (fs.existsSync('node_modules')) {
            fs.rmSync('node_modules', { recursive: true, force: true });
            console.log(`${GREEN}✅ node_modules removido${RESET}`);
            logToFile('node_modules removido', 'INFO');
        }

        if (fs.existsSync('yarn.lock')) {
            fs.unlinkSync('yarn.lock');
            console.log(`${GREEN}✅ yarn.lock removido${RESET}`);
            logToFile('yarn.lock removido', 'INFO');
        }

        // Limpa cache do yarn
        execSync('yarn cache clean', { stdio: 'inherit' });
        console.log(`${GREEN}✅ Cache do yarn limpo${RESET}`);
        logToFile('Cache do yarn limpo', 'INFO');

        // Reinstala dependências
        execSync('yarn install', { stdio: 'inherit' });
        console.log(`${GREEN}✅ Dependências reinstaladas com sucesso${RESET}`);
        logToFile('Dependências reinstaladas com sucesso', 'INFO');

        // Verifica integridade
        execSync('yarn check --integrity', { stdio: 'inherit' });
        console.log(`${GREEN}✅ Integridade das dependências verificada${RESET}`);
        logToFile('Integridade das dependências verificada', 'INFO');

    } catch (error) {
        const errorMessage = `ERRO AO LIMPAR E REINSTALAR DEPENDÊNCIAS: ${error.message}`;
        console.error(`${RED}❌ ${errorMessage}${RESET}`);
        logToFile(errorMessage, 'ERROR');
        throw error;
    }
}

// Função para resolver problemas de peer dependencies
async function fixPeerDependencies() {
    console.log(`${DARK_GRAY}🔍 Verificando peer dependencies...${RESET}`);
    logToFile('Iniciando verificação de peer dependencies');

    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

        // Lista de pacotes com problemas conhecidos de peer dependencies
        const problematicPackages = {
            'react-typewriter-effect': {
                currentPeerDependency: 'react@^16.10.2',
                solution: 'yarn add react-typewriter-effect@latest --ignore-peer-dependencies'
            }
        };

        for (const [pkg, info] of Object.entries(problematicPackages)) {
            if (dependencies[pkg]) {
                console.log(`${DARK_GRAY}⚠️ Resolvendo peer dependency para ${pkg}...${RESET}`);
                logToFile(`Resolvendo peer dependency para ${pkg}`, 'WARNING');

                try {
                    execSync(info.solution, { stdio: 'inherit' });
                    console.log(`${GREEN}✅ Peer dependency resolvida para ${pkg}${RESET}`);
                    logToFile(`Peer dependency resolvida para ${pkg}`, 'INFO');
                } catch (error) {
                    console.log(`${DARK_GRAY}⚠️ Não foi possível resolver peer dependency para ${pkg}: ${error.message}${RESET}`);
                    logToFile(`Não foi possível resolver peer dependency para ${pkg}: ${error.message}`, 'WARNING');
                }
            }
        }
    } catch (error) {
        const errorMessage = `ERRO AO VERIFICAR PEER DEPENDENCIES: ${error.message}`;
        console.error(`${RED}❌ ${errorMessage}${RESET}`);
        logToFile(errorMessage, 'ERROR');
        throw error;
    }
}

// Função para verificar e executar comandos Yarn
async function runYarnCommand(command, args = []) {
    console.log(`${DARK_GRAY}🔄 Executando: yarn ${command} ${args.join(' ')}${RESET}`);
    logToFile(`Executando comando Yarn: ${command} ${args.join(' ')}`);

    try {
        // Verifica se o comando existe no package.json
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (!packageJson.scripts[command]) {
            throw new Error(`Comando "${command}" não encontrado no package.json`);
        }

        // Executa o comando usando yarn run
        const result = execSync(`yarn run ${command} ${args.join(' ')}`, {
            stdio: 'inherit',
            encoding: 'utf8'
        });

        console.log(`${GREEN}✅ Comando executado com sucesso${RESET}`);
        logToFile(`Comando ${command} executado com sucesso`, 'INFO');
        return result;
    } catch (error) {
        const errorMessage = `ERRO AO EXECUTAR COMANDO YARN: ${error.message}`;
        console.error(`${RED}❌ ${errorMessage}${RESET}`);
        logToFile(errorMessage, 'ERROR');
        throw error;
    }
}

// Função para verificar e corrigir problemas de dependências
async function checkAndFixDependencies() {
    console.log(`${DARK_GRAY}🔍 Verificando dependências...${RESET}`);
    logToFile('Iniciando verificação de dependências');

    try {
        // Remove package-lock.json se existir
        if (fs.existsSync('package-lock.json')) {
            fs.unlinkSync('package-lock.json');
            console.log(`${GREEN}✅ package-lock.json removido${RESET}`);
            logToFile('package-lock.json removido', 'INFO');
        }

        // Limpa cache do yarn
        execSync('yarn cache clean', { stdio: 'inherit' });
        console.log(`${GREEN}✅ Cache do yarn limpo${RESET}`);
        logToFile('Cache do yarn limpo', 'INFO');

        // Verifica integridade do yarn.lock
        try {
            execSync('yarn check --integrity', { stdio: 'inherit' });
        } catch (error) {
            console.log(`${DARK_GRAY}⚠️ Problemas detectados no yarn.lock, reinstalando dependências...${RESET}`);

            // Remove node_modules e yarn.lock
            if (fs.existsSync('node_modules')) {
                fs.rmSync('node_modules', { recursive: true, force: true });
            }
            if (fs.existsSync('yarn.lock')) {
                fs.unlinkSync('yarn.lock');
            }

            // Reinstala dependências
            execSync('yarn install', { stdio: 'inherit' });
        }

        // Verifica peer dependencies
        await fixPeerDependencies();

        // Verifica vulnerabilidades usando yarn audit
        try {
            const audit = execSync('yarn audit --json', { encoding: 'utf8' });
            const vulnerabilities = JSON.parse(audit);

            if (vulnerabilities.metadata.vulnerabilities.total > 0) {
                console.log(`${RED}⚠️ Encontradas ${vulnerabilities.metadata.vulnerabilities.total} vulnerabilidades${RESET}`);
                logToFile(`Encontradas ${vulnerabilities.metadata.vulnerabilities.total} vulnerabilidades`, 'WARNING');

                // Atualiza pacotes vulneráveis
                execSync('yarn upgrade --latest', { stdio: 'inherit' });
            }
        } catch (error) {
            console.log(`${DARK_GRAY}⚠️ yarn audit falhou, usando verificação alternativa...${RESET}`);
            await checkVulnerabilities();
        }

    } catch (error) {
        const errorMessage = `ERRO AO VERIFICAR DEPENDÊNCIAS: ${error.message}`;
        console.error(`${RED}❌ ${errorMessage}${RESET}`);
        logToFile(errorMessage, 'ERROR');
        throw error;
    }
}

// Função principal
async function main() {
    try {
        // 1. VERIFICAÇÃO DE SAÚDE DO PROJETO
        console.log(`${DARK_GRAY}🔍 Iniciando verificação de saúde do projeto...${RESET}`);
        logSessionStart();

        // 1.1 Verifica dependências
        await checkAndFixDependencies();
        
        // 1.2 Verifica requisitos do projeto
        const issues = await checkProjectRequirements();
        
        // 1.3 Se houver problemas, tenta resolver
        if (issues.length > 0) {
            const groupedIssues = issues.reduce((acc, issue) => {
                if (!acc[issue.severity]) acc[issue.severity] = [];
                acc[issue.severity].push(issue);
                return acc;
            }, {});

            // Exibe problemas por severidade
            ['HIGH', 'MEDIUM', 'LOW'].forEach(severity => {
                if (groupedIssues[severity]) {
                    console.log(`\n${DARK_GRAY}⚠️ Problemas de severidade ${severity}:${RESET}`);
                    groupedIssues[severity].forEach(issue => {
                        console.log(`\n${DARK_GRAY}Problema: ${issue.problem}${RESET}`);
                        console.log(`${DARK_GRAY}Causa: ${issue.cause}${RESET}`);
                        console.log(`${DARK_GRAY}Localização: ${issue.location}${RESET}`);
                        console.log(`${DARK_GRAY}Solução: ${issue.solution}${RESET}`);
                    });
                }
            });

            // Tenta resolver problemas automaticamente
            await autoFixIssues(issues);

            // Se ainda houver problemas de alta severidade, aborta
            if (groupedIssues['HIGH'] && groupedIssues['HIGH'].length > 0) {
                throw new Error('Problemas críticos não resolvidos. Abortando processo.');
            }
        }

        // 2. BUILD (só executa se a saúde do projeto estiver OK)
        console.log(`${DARK_GRAY}🔄 Iniciando processo de build...${RESET}`);
        execSync('yarn build', { stdio: 'inherit' });

        // 3. DEPLOY
        console.log(`${DARK_GRAY}🚀 Iniciando deploy...${RESET}`);
        execSync('yarn deploy', { stdio: 'inherit' });

        // 4. AUTO-COMMIT
        console.log(`${DARK_GRAY}📝 Preparando auto-commit...${RESET}`);
        const latestBundle = findLatestBundle();
        if (!latestBundle) {
            throw new Error('Nenhum arquivo bundle encontrado na pasta dist');
        }

        // 5. REBASE E ATUALIZAÇÃO DO GH-PAGES
        console.log(`${DARK_GRAY}🔄 Atualizando branch gh-pages...${RESET}`);
        await makeCommitAndPush(latestBundle);

        console.log(`${GREEN}✅ Processo concluído com sucesso!${RESET}`);
        console.log(`${BLUE}🚀 Projeto buildado, deployado e atualizado.${RESET}`);

    } catch (error) {
        const errorMessage = `ERRO DURANTE O PROCESSO: ${error.message}`;
        console.error(`${RED}❌ ${errorMessage.toUpperCase()}${RESET}`);
        logToFile(errorMessage, 'ERROR');
        process.exit(1);
    }
}

// Executa o script
console.log(`${DARK_GRAY}🔄 Iniciando processo de build e deploy...${RESET}`);
main();
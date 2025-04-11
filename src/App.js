import React, { useState, createContext, useEffect } from 'react';
import Post from './Post';
import Button from './Button';
import Header from './Header';
import './styles/App.scss';

export const ThemeContext = createContext({
    theme: "dark",
    onToggleTheme: () => { }
});

function App() {
    const [theme, setTheme] = useState("dark");
    const [collapsedPosts, setCollapsedPosts] = useState(new Set());
    const [posts, setPosts] = useState([
        {
            id: Math.random(),
            title: "ESTILIZAÇÃO NO REACT",
            content: "Existem várias formas de estilizar componentes no React, incluindo:",
            items: [
                "CSS inline",
                "CSS Modules",
                "CSS Tradicional",
                "CSS-in-JS (Styled Components, Emotion)",
                "CSS Modules",
                "Frameworks CSS (Bootstrap, Tailwind)",
                "Classes dinâmicas"
            ]
        },
        {
            id: Math.random(),
            title: "📖 Conceitos de estilização do react",
            isSection: true,
        },
        {
            id: Math.random(),
            title: "Inline styles",
            content: "",
            items: [
                "Refere-se a uma técnica de estilização em arquivos .js ou .jsx do React, onde os estilos são aplicados diretamente em elementos JSX por meio da propriedade style.",
                "Ao contrário do CSS tradicional, utiliza objetos JavaScript para definir os estilos, exigindo que os valores sejam strings [style={{ Color: '#000' }}] e que propriedades com hífens sejam convertidas para camelCase, como background-color se tornando [style={{ backgroundColor: '#000' }}]",
                "Essa abordagem proporciona uma estilização dinâmica e integrada em componentes React, aproveitando a lógica do JavaScript para manipular estilos de forma condicional ou baseada em estados.",
                "Muito utilizada para estilização rápida e específica de componentes, especialmente quando se deseja aplicar estilos que dependem do estado ou das props do componente.",
                "Ou em projetos menores, onde a simplicidade e a rapidez são mais importantes do que a manutenção a longo prazo.",
                "Também é importante para manter um Escopo local automático que evita conflitos de estilo comuns em CSS global, pois os inline styles são aplicados diretamente ao elemento JSX, garantindo que o estilo seja isolado ao componente sem necessidade de ferramentas adicionais como CSS Modules ou namespaces."
            ],
            code: `// Exemplo de aplicação de estilos inline
            
function App() {
  const [theme, setTheme] = useState("dark");

  return (
    <div style={{ backgroundColor: theme === "dark" ? "#333" : "#fff", color: theme === "dark" ? "#fff" : "#000", padding: "10px" }}>
      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        Trocar Tema
      </button>
    </div>
  );
}`
        },
        {
            id: Math.random(),
            title: "Arquivos CSS no react",
            content: "O React e o JavaScript não reconhecem nativamente a importação de CSS externo, mas lidam bem com CSS inline. Para importar e trabalhar com arquivos CSS externos em componentes React ou JavaScript, é necessário configurar o Webpack com css-loader e style-loader. Esses loaders convertem CSS em módulos JavaScript e injetam os estilos no DOM dinamicamente. O Webpack Dev Server atualiza as alterações em tempo real, simplificando a organização e aplicação eficiente de estilos em projetos.",
            items: [
                "css-Loaders: Converte @import e url() do CSS em require() do JavaScript para o Webpack resolver dependências; por exemplo, transforma url('./imagem.png') em um módulo importado.",
                "style-loarder: Adiciona o CSS processado ao DOM dinamicamente, inserindo-o como uma tag <style>, ideal para estilização imediata no navegador; por exemplo, transforma require('./estilo.css') em estilos aplicados diretamente na página.",
                "prompt no terminal: 'yarn add css-loader style-loader -D'",
                "https://webpack.js.org/loaders/css-loader/"
            ],
            code: `// Exemplo de uso do css externo dentro do react:

// Recorte exemplo do webpack.config.js

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ],
            },
        ]
    },

// Exemplo do arquvo css externo Examplefile.css 

    .b { padding: 5px; background: #00f; color: #fff; }
    .a { background: #0f0; }

// Exemplo de aplicação do css externo no react

    import { useState } from 'react';
    import './Examplefile.css';

    function App() {
        const [on, setOn] = useState(false);
        return (
            <button className={on ? 'b a' : 'b'} onClick={() => setOn(!on)}>
            OK
            </button>
        );   
    }
    ...`
        },
        {
            id: Math.random(),
            title: "useContext - Acesso ao Contexto",
            content: "O useContext permite acessar valores de um contexto React. No nosso projeto, usamos para:",
            items: [
                "Compartilhar o tema entre componentes",
                "Compartilhar funções de manipulação do tema"
            ],
            code: `// Exemplo do ThemeContext
export const ThemeContext = createContext({
    theme: "dark",
    onToggleTheme: () => {}
});

// Uso em um componente filho
function Button() {
    const { theme, onToggleTheme } = useContext(ThemeContext);
    
    return (
        <button 
            onClick={onToggleTheme}
            style={{
                backgroundColor: theme === "dark" ? "#333" : "#fff",
                color: theme === "dark" ? "#fff" : "#333"
            }}
        >
            Mudar Tema
        </button>
    );
}`
        },
        {
            id: Math.random(),
            title: "O que é Context API?",
            content: "Context API é um sistema do React para compartilhar dados entre componentes sem precisar passar props manualmente em cada nível da árvore de componentes (prop drilling). No nosso projeto, usamos para:",
            items: [
                "Tema Global: Compartilhar o estado do tema (claro/escuro) entre todos os componentes",
                "Funções Compartilhadas: Compartilhar a função de alternar tema sem precisar passar por vários níveis"
            ],
            code: `// Exemplo completo do Context no App.js
export const ThemeContext = createContext({
    theme: "dark",
    onToggleTheme: () => {}
});

function App() {
    const [theme, setTheme] = useState("dark");

    function handleToggleTheme() {
        setTheme(prevState => prevState === "dark" ? "light" : "dark");
    }

    return (
        <ThemeContext.Provider value={{ theme, onToggleTheme: handleToggleTheme }}>
            <Header />
            <PostList />
            <Footer />
        </ThemeContext.Provider>
    );
}`
        },
        {
            id: Math.random(),
            title: "🎯 Benefícios das Ferramentas Utilizadas",
            isSection: true,
        },
        {
            id: Math.random(),
            title: "React e React DOM",
            items: [
                "Virtual DOM: Renderização eficiente de componentes",
                "Componentização: Reutilização de código e manutenção simplificada",
                "Hooks: Gerenciamento de estado e efeitos colaterais de forma elegante",
                "Context API: Compartilhamento de estado entre componentes sem prop drilling"
            ],
            code: `// Exemplo de uso do Context API e Hooks
export const ThemeContext = createContext({
    theme: "dark",
    onToggleTheme: () => {}
});

function App() {
    const [theme, setTheme] = useState("dark");
    const [posts, setPosts] = useState([
        { id: Math.random(), name: "Fernando", subtitle: "Desenvolvedor Frontend", likes: 200 }
    ]);

    return (
        <ThemeContext.Provider value={{ theme, onToggleTheme: handleToggleTheme }}>
            {/* Componentes filhos */}
        </ThemeContext.Provider>
    );
}`
        },
        {
            id: Math.random(),
            title: "Webpack e Babel",
            items: [
                "Bundling: Otimização e minificação de código",
                "Code Splitting: Carregamento sob demanda de módulos",
                "Hot Module Replacement: Atualização em tempo real durante o desenvolvimento",
                "Transpilação: Suporte a recursos modernos do JavaScript",
                "Tree Shaking: Eliminação de código não utilizado"
            ],
            code: `// webpack.config.js
module.exports = {
    entry: path.resolve(__dirname, 'src', 'index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle[hash].js',
        publicPath: '/reac-fundamentos/'
    },
    module: {
        rules: [
            {
                test: /\\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            }
        ]
    }
};`
        },
        {
            id: Math.random(),
            title: "Plugins",
            items: [
                "HTML Webpack Plugin: Geração automática de HTML com injeção de assets",
                "Clean Webpack Plugin: Limpeza automática de builds antigos",
                "GH Pages: Deploy automatizado para GitHub Pages"
            ]
        },
        {
            id: Math.random(),
            title: "🚀 Tecnologias e Bibliotecas Utilizadas",
            isSection: true,
        },
        {
            id: Math.random(),
            title: "Core",
            items: [
                "React 19.1.0",
                "React DOM 19.1.0",
                "Prop Types 15.8.1"
            ]
        },
        {
            id: Math.random(),
            title: "Build Tools",
            items: [
                "Webpack 5.98.0",
                "Webpack CLI 6.0.1",
                "Webpack Dev Server 5.2.1",
                "Babel Core 7.26.10",
                "Babel Preset Env 7.26.9",
                "Babel Preset React 7.26.3",
                "Babel Loader 10.0.0"
            ]
        },
        {
            id: Math.random(),
            title: "Plugins",
            items: [
                "HTML Webpack Plugin 5.6.3",
                "Clean Webpack Plugin 4.0.0",
                "GH Pages 6.3.0"
            ]
        },
        {
            id: Math.random(),
            title: "📦 Instalação das Dependências",
            isSection: true,
        },
        {
            id: Math.random(),
            title: "Comandos de Instalação",
            code: `# Instalação do React e React DOM
npm install react react-dom

# Instalação do Prop Types
npm install prop-types

# Instalação das ferramentas de build
npm install --save-dev webpack webpack-cli webpack-dev-server

# Instalação do Babel e seus presets
npm install --save-dev @babel/core @babel/preset-env @babel/preset-react babel-loader

# Instalação dos plugins
npm install --save-dev html-webpack-plugin clean-webpack-plugin gh-pages`
        }
    ]);

    useEffect(() => {
        document.body.className = theme; // Aplica a classe de tema ao body
    }, [theme]);

    function handleToggleTheme() {
        setTheme((prevState) => (prevState === "dark" ? "light" : "dark"));
    }

    function handleRefresh() {
        setPosts(prevState => [
            ...prevState,
            {
                id: Math.random(),
                title: `Novo Conceito ${prevState.length + 1}`,
                content: `Explicação do conceito ${prevState.length + 1}`,
                items: [],
                code: ''
            }
        ]);
    }

    function handleRemovePost(postId) {
        setPosts((prevState) => prevState.filter(post => post.id !== postId));
    }

    function handleTogglePost(postId) {
        setCollapsedPosts(prevState => {
            const newState = new Set(prevState);
            if (newState.has(postId)) newState.delete(postId);
            else newState.add(postId);
            return newState;
        });
    }

    return (
        <ThemeContext.Provider value={{ theme, onToggleTheme: handleToggleTheme }}>
            <div className={`app-container ${theme}`}>
                <Header />

                <div className="posts-container">
                    {posts.map((post) => (
                        <div key={post.id} className={`post-card ${theme}`}>
                            {post.isTitle ? (
                                <h1 className={theme}>{post.title}</h1>
                            ) : post.isSection ? (
                                <h2 className={theme}>{post.title}</h2>
                            ) : (
                                <>
                                    <div className="post-actions">
                                        <h3 className={theme}>{post.title}</h3>
                                        <div className="button-container">
                                            <Button
                                                onClick={() => handleTogglePost(post.id)}
                                                className="toggle-button"
                                            >
                                                {collapsedPosts.has(post.id) ? 'Expandir' : 'Minimizar'}
                                            </Button>
                                        </div>
                                    </div>
                                    {!collapsedPosts.has(post.id) && (
                                        <>
                                            {post.content && (
                                                <p className={theme}>{post.content}</p>
                                            )}
                                            {post.items && (
                                                <ul>
                                                    {post.items.map((item, index) => (
                                                        <li key={index} className={theme}>{item}</li>
                                                    ))}
                                                </ul>
                                            )}
                                            {post.code && (
                                                <pre className={theme}>
                                                    <code>{post.code}</code>
                                                </pre>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>

                <footer className={`footer ${theme}`}>
                    <div className="footer-links">
                        <a href="https://www.linkedin.com/in/feryamaha/" target="_blank" rel="noopener noreferrer">
                            <svg height="20" width="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                        </a>
                        <a href="https://github.com/feryamaha/reac-fundamentos" target="_blank" rel="noopener noreferrer">
                            <svg height="20" width="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </a>
                    </div>
                    <p>© 2024 - Feito por Fernando Moreira</p>
                </footer>
            </div>
        </ThemeContext.Provider>
    );
}

export default App;
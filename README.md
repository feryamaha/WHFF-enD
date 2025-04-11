# WHFF-enD - Fundamentos do React

Este projeto foi desenvolvido como parte do aprendizado dos fundamentos do React, explorando conceitos importantes como Context API, Hooks, Componentização, Gerenciamento de Estado e Estilização. Ele também utiliza ferramentas modernas de desenvolvimento como Webpack e Babel para criar uma aplicação robusta e escalável.

## 📖 Estrutura do Projeto

O projeto é dividido em várias partes principais:

1. **Componentes React**:
    - `App.js`: Componente principal que gerencia o estado global, tema, linguagem e navegação.
    - `Header.js`: Cabeçalho com navegação entre stacks e controle de tema/idioma.
    - `IntroSection.js`: Seção inicial com introdução às stacks disponíveis.
    - `ContentPosts.js`: Exibe os posts relacionados a uma stack e conteúdo selecionados.
    - `Post.js` e `PostHeader.js`: Componentes para exibir posts e seus cabeçalhos.

2. **Estilização**:
    - Utiliza SASS para modularidade e reutilização de estilos.
    - Arquivos SCSS organizados em `src/styles/` para cada componente.
    - Responsividade implementada com media queries.

3. **Dados**:
    - Arquivos JSON em `data/` para armazenar informações sobre stacks e conteúdos.

4. **Ferramentas de Build**:
    - Webpack para bundling e configuração de loaders (CSS, SASS, imagens, JSON).
    - Babel para transpilação de código moderno JavaScript e JSX.

## 🚀 Funcionalidades

### 1. **Gerenciamento de Tema**
- O tema pode ser alternado entre "dark" e "light" usando o botão no cabeçalho.
- Implementado com o `useState` e compartilhado via `ThemeContext`.

### 2. **Suporte a Idiomas**
- Suporte a três idiomas: Português, Inglês e Espanhol.
- O idioma pode ser alterado no cabeçalho, e os textos são atualizados dinamicamente.

### 3. **Navegação entre Stacks e Conteúdos**
- As stacks disponíveis são carregadas de `data/stacks.json`.
- A navegação entre stacks e conteúdos é gerenciada pelo estado global no componente `App`.

### 4. **Estilização Avançada**
- Estilos responsivos para diferentes tamanhos de tela.
- Uso de variáveis SCSS para temas e transições suaves.

### 5. **Deploy Automatizado**
- Configurado para deploy no GitHub Pages com o comando `yarn deploy`.

## 🛠️ Ferramentas e Tecnologias

### **Frontend**
- React 19.1.0
- React Router DOM 7.5.0
- PropTypes para validação de props.

### **Estilização**
- SASS para modularidade e reutilização de estilos.
- CSS Loader e Style Loader configurados no Webpack.

### **Build e Deploy**
- Webpack 5.98.0 para bundling.
- Babel para transpilação de código moderno.
- GH Pages para deploy automatizado.

## 📂 Estrutura de Pastas
```
WHFF-enD/
├── public/     # Arquivos públicos (index.html)
├── src/        # Código-fonte do projeto
│   ├── assets/ # Imagens e outros assets
│   ├── styles/ # Arquivos SCSS para estilização
│   ├── App.js  # Componente principal
│   └── index.js # Ponto de entrada do React
├── data/       # Dados em JSON
├── dist/       # Arquivos gerados pelo Webpack
├── webpack.config.js # Configuração do Webpack
└── package.json # Dependências e scripts
```

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
yarn dev    # Inicia o servidor de desenvolvimento

# Build
yarn build  # Gera os arquivos para produção

# Deploy
yarn deploy # Deploy no GitHub Pages
```

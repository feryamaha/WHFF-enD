# WHFF-enD - Fundamentos do React

Deploy: https://feryamaha.github.io/WHFF-enD/

# Sobre o Projeto

Este projeto é um hub de conhecimento em React, desenvolvido como parte do processo de aprendizado, explorando conceitos fundamentais como:

- Context API
- Hooks
- Componentização
- Gerenciamento de Estado
- Estilização Moderna

A aplicação utiliza ferramentas atuais como Webpack e Babel para garantir robustez e escalabilidade. O conteúdo é atualizado continuamente com novos aprendizados em React e tecnologias front-end relevantes da WHFF.enD.

> WHFF.enD é um acrônimo para "Web Hub Fernando Front-end", representando um repositório pessoal de estudos e práticas em desenvolvimento web.

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
├── data/                  # Dados em JSON
│   ├── stacks.json
│   └── react-estilizacao.json
├── dist/                  # Build de produção
│   ├── assets/
│   ├── bundle5b7970a428975b852139.js
│   ├── bundle5b7970a428975b852139.js.LICENSE.txt
│   └── index.html
├── public/               # Arquivos públicos
│   └── index.html
├── src/                 # Código-fonte do projeto
│   ├── assets/         # Recursos estáticos
│   ├── styles/         # Arquivos de estilo
│   │   ├── App.scss
│   │   ├── Button.scss
│   │   ├── Header.scss
│   │   ├── IntroSection.scss
│   │   ├── Post.scss
│   │   └── reset.scss
│   ├── App.js
│   ├── Button.js
│   ├── ContentPosts.js
│   ├── Header.js
│   ├── index.js
│   ├── IntroSection.js
│   ├── Post.js
│   └── PostHeader.js
├── webpack.config.js
├── package.json
├── package-lock.json
└── yarn.lock
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

## 🔄 Atualizando o Branch gh-pages

### 1. Voltar para o Branch main

```bash
git checkout main
```

### 2. Fazer o Build

```bash
yarn build
```

### 3. Instalar gh-pages

```bash
yarn add --dev gh-pages
```

### 4. Configurar Script de Deploy

No `package.json`:

```json
"scripts": {
    "deploy": "gh-pages -d dist"
}
```

### 5. Fazer o Deploy

```bash
yarn deploy
```

### 6. Verificar Branch

```bash
git fetch origin
git branch -r
git ls-tree origin/gh-pages
```

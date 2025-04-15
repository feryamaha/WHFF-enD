# Lições Aprendidas - WHFF-enD

## 1. Gerenciamento de Dependências

### O que aprendemos:
- **Não misturar gerenciadores de pacotes**: Tentar usar npm e yarn no mesmo projeto causa conflitos
- **Manter lockfiles consistentes**: O yarn.lock deve ser o único arquivo de lock no projeto
- **Verificar compatibilidade de versões**: Especialmente com React e seus pacotes relacionados

### O que deu certo:
- Usar yarn como gerenciador principal
- Limpar cache antes de reinstalar dependências
- Verificar peer dependencies antes de instalar

### O que deu errado:
- Tentar usar npm audit em um projeto yarn
- Misturar package-lock.json com yarn.lock
- Ignorar warnings de peer dependencies

## 2. Versionamento e Deploy

### O que aprendemos:
- **Importância do rebase**: 
  - Rebase mantém o histórico limpo e linear
  - Evita commits de merge desnecessários
  - Facilita a compreensão do histórico do projeto
  - Ideal para branches de feature que serão integradas à main
- **Deploy automático**: Integração com gh-pages
- **Commits significativos**: Mensagens claras e descritivas

### O que deu certo:
- Uso de rebase ao invés de merge para atualizar branches
- Script de auto-commit
- Deploy automático para gh-pages

### O que deu errado:
- Usar push force desnecessariamente
- Commits automáticos sem verificação
- Ignorar conflitos durante rebase

## 3. Desenvolvimento React

### O que aprendemos:
- **Componentização**:
  - Componentes pequenos e reutilizáveis
  - Separação clara de responsabilidades
  - Props bem definidas e tipadas
- **Hooks**:
  - Uso correto de useEffect para side effects
  - useState para gerenciamento de estado local
  - useContext para estado global
- **Performance**:
  - Memoização com useMemo e useCallback
  - Lazy loading de componentes
  - Code splitting

### O que deu certo:
- Estrutura modular de componentes
- Uso eficiente de hooks
- Gerenciamento de estado com Context API

### O que deu errado:
- Componentes muito grandes
- Efeitos colaterais mal gerenciados
- Re-renders desnecessários

## 4. Estilização e SCSS

### O que aprendemos:
- **SCSS vs CSS Inline**:
  - SCSS oferece melhor organização e manutenção
  - Variáveis para temas e cores
  - Mixins para reutilização de estilos
  - Aninhamento para melhor legibilidade
- **Modularização**:
  - Arquivos SCSS por componente
  - Importação seletiva de estilos
  - Escopo de estilos limitado ao componente
- **Responsividade**:
  - Media queries organizadas
  - Breakpoints consistentes
  - Layout fluido

### O que deu certo:
- Estrutura modular de estilos
- Uso de variáveis para temas
- Responsividade bem implementada

### O que deu errado:
- Estilos inline em componentes
- Duplicação de código CSS
- Media queries inconsistentes

## 5. Processo de Build e Deploy

### O que aprendemos:
- **Importância da verificação manual**: Os 30 segundos de verificação são cruciais
- **Ordem correta das operações**: Build → Verificação → Commit → Deploy
- **Manter o servidor ativo**: Permite testes contínuos após o deploy

### O que deu certo:
- Contagem regressiva para verificação
- Logs detalhados em cada etapa
- Opção de interromper o processo se necessário

### O que deu errado:
- Tentar automatizar tudo sem verificação
- Executar deploy antes de confirmar que tudo está funcionando
- Não ter logs claros do processo

## 6. Melhores Práticas Identificadas

1. **Versionamento**:
   - Usar rebase ao invés de merge para branches de feature
   - Commits atômicos e bem descritos
   - Manter histórico limpo e linear

2. **React**:
   - Componentes pequenos e focados
   - Hooks bem utilizados
   - Performance otimizada

3. **Estilização**:
   - SCSS modular
   - Variáveis para temas
   - Responsividade consistente

4. **Build e Deploy**:
   - Verificação manual antes do deploy
   - Logs claros e detalhados
   - Processo bem definido

## 7. Próximos Passos e Melhorias

1. **Automação**:
   - Implementar testes automatizados
   - CI/CD pipeline
   - Verificações de qualidade

2. **Documentação**:
   - Guia de contribuição
   - Documentação de componentes
   - Changelog atualizado

3. **Performance**:
   - Otimização de bundle
   - Lazy loading
   - Cache de assets

4. **Segurança**:
   - Verificação de vulnerabilidades
   - Boas práticas de segurança
   - Dependências atualizadas 
# Guia de Instalação e Solução de Problemas

## 📥 Instalação Passo a Passo

### Opção 1: Via Manifest URL (Mais Fácil)

1. **Abra o Foundry VTT**
2. **Vá para "Add-on Modules"** (no menu de configuração do mundo)
3. **Clique em "Install Module"**
4. **Cole este URL** no campo "Manifest URL":
   ```
   https://raw.githubusercontent.com/questionwho42-jpg/foundry-ia/main/module.json
   ```
5. **Clique em "Install"**
6. **Ative o módulo** nas configurações do seu mundo

### Opção 2: Download Manual

1. **Baixe o ZIP**:
   - Vá para: https://github.com/questionwho42-jpg/foundry-ia
   - Clique em "Code" → "Download ZIP"

2. **Extraia os arquivos**:
   - Localize a pasta de dados do Foundry:
     - Windows: `%LOCALAPPDATA%\FoundryVTT\Data\modules`
     - Linux: `~/.local/share/FoundryVTT/Data/modules`
     - Mac: `~/Library/Application Support/FoundryVTT/Data/modules`
   
3. **Crie a pasta do módulo**:
   - Dentro de `modules`, crie uma pasta chamada **exatamente**: `ai-dungeon-master-pf2e`
   
4. **Cole os arquivos**:
   - Extraia TODOS os arquivos do ZIP para dentro de `ai-dungeon-master-pf2e`
   - A estrutura deve ficar assim:
   ```
   Data/modules/ai-dungeon-master-pf2e/
   ├── module.json
   ├── README.md
   ├── LICENSE
   ├── scripts/
   ├── styles/
   ├── templates/
   └── lang/
   ```

5. **Reinicie o Foundry VTT**

6. **Ative o módulo** nas configurações do mundo

## 🔧 Solução de Problemas

### ❌ Erro: "Module not found"

**Causas comuns:**

1. **Nome da pasta errado**
   - ✅ Correto: `ai-dungeon-master-pf2e`
   - ❌ Errado: `foundry-ia`, `foundry-ia-main`, `ai-dungeon-master`
   
   **Solução**: Renomeie a pasta para exatamente `ai-dungeon-master-pf2e`

2. **Arquivos no lugar errado**
   - ❌ Errado: `modules/ai-dungeon-master-pf2e/foundry-ia-main/module.json`
   - ✅ Correto: `modules/ai-dungeon-master-pf2e/module.json`
   
   **Solução**: Mova todos os arquivos para o nível correto da pasta

3. **module.json corrompido**
   - Baixe novamente do GitHub
   - Verifique se o arquivo não tem erros de encoding

### ❌ Módulo não aparece na lista

1. **Verifique a localização da pasta**:
   ```powershell
   # Windows PowerShell - Execute para ver onde está a pasta Data
   $env:LOCALAPPDATA\FoundryVTT\Data\modules
   ```

2. **Verifique permissões**:
   - Certifique-se de que o Foundry tem permissão para ler a pasta
   
3. **Reinicie completamente o Foundry VTT**

### ❌ Módulo ativa mas não funciona

1. **Verifique o Console (F12)**:
   - Procure por erros em vermelho
   - Erros comuns e soluções:
     - `Cannot find module`: Arquivos faltando
     - `Syntax Error`: arquivo JavaScript corrompido
     - `API Key not configured`: Configure a chave API

2. **Configure a chave API**:
   - Obtenha em: https://ai.google.dev/
   - Configure em: Game Settings → Module Settings → AI Dungeon Master

### ❌ Sistema PF2e não detectado

O módulo requer o sistema Pathfinder 2e instalado e ativo:

1. **Instale o sistema PF2e**:
   - Add-on Systems → Install System
   - Procure por "Pathfinder 2e"
   
2. **Crie ou use um mundo PF2e**:
   - O módulo só funciona em mundos usando o sistema PF2e

## 🧪 Testando a Instalação

1. **Após ativar o módulo, abra o Console (F12)**

2. **Procure por esta mensagem**:
   ```
   AI Dungeon Master | Inicializando módulo
   AI Dungeon Master | Módulo carregado e pronto
   ```

3. **Se você é GM, procure o botão do robô** nos controles de cena

4. **Teste o comando de chat**:
   ```
   /dm
   ```

## 📞 Ainda com Problemas?

1. **Verifique os logs**:
   - Abra o Console (F12)
   - Aba "Console"
   - Copie qualquer erro em vermelho

2. **Abra uma Issue no GitHub**:
   - https://github.com/questionwho42-jpg/foundry-ia/issues
   - Inclua:
     - Versão do Foundry VTT
     - Sistema de jogo
     - Mensagens de erro do console
     - Passos que você seguiu

3. **Informações úteis para reportar**:
   ```javascript
   // Cole isso no Console (F12) e copie o resultado:
   {
     foundry: game.version,
     system: game.system.id,
     systemVersion: game.system.version,
     modules: Array.from(game.modules.entries()).filter(([k,v]) => v.active).map(([k,v]) => `${k}: ${v.version}`)
   }
   ```

## ✅ Checklist de Instalação

- [ ] Foundry VTT versão 11 ou superior
- [ ] Sistema Pathfinder 2e instalado e ativo
- [ ] Pasta do módulo nomeada corretamente: `ai-dungeon-master-pf2e`
- [ ] Arquivo `module.json` presente na raiz da pasta do módulo
- [ ] Pastas `scripts`, `styles`, `templates`, `lang` presentes
- [ ] Foundry VTT reiniciado após instalação
- [ ] Módulo ativado nas configurações do mundo
- [ ] Chave API do Google Gemini configurada
- [ ] Nenhum erro no Console (F12)

Se todos os itens estiverem marcados e ainda houver problemas, abra uma issue!

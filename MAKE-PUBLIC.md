# 🔓 Como Tornar o Repositório Público

O erro "No module manifest found" está acontecendo porque o repositório GitHub está **privado**. O Foundry VTT precisa acessar o arquivo `module.json` publicamente.

## 📝 Passos para Tornar o Repositório Público

### Via Interface Web do GitHub:

1. **Acesse o repositório**:

   - Vá para: https://github.com/questionwho42-jpg/foundry-ia

2. **Abra as Configurações**:

   - Clique na aba **Settings** (Configurações)
   - Role até o final da página

3. **Seção "Danger Zone"**:

   - Procure pela seção chamada **"Danger Zone"** (Zona de Perigo) no final
   - Encontre a opção **"Change repository visibility"** (Mudar visibilidade do repositório)
   - Clique em **"Change visibility"**

4. **Selecione "Public"**:

   - Escolha a opção **"Make public"** (Tornar público)
   - Digite o nome do repositório para confirmar: `questionwho42-jpg/foundry-ia`
   - Clique em **"I understand, change repository visibility"**

5. **Pronto!**
   - Aguarde alguns segundos
   - O repositório agora está público

## ✅ Verificar se Funcionou

Após tornar o repositório público, teste se o manifest está acessível:

1. **Abra este link no navegador**:

   ```
   https://raw.githubusercontent.com/questionwho42-jpg/foundry-ia/main/module.json
   ```

2. **Você deve ver o conteúdo do arquivo JSON**:
   - Se aparecer o código JSON ✅ Funcionou!
   - Se aparecer "404 Not Found" ❌ Ainda está privado

## 🎮 Instalar no Foundry VTT

Depois que o repositório estiver público:

1. **No Foundry VTT**:

   - Add-on Modules → Install Module
   - Cole o Manifest URL:
     ```
     https://raw.githubusercontent.com/questionwho42-jpg/foundry-ia/main/module.json
     ```
   - Clique em **Install**

2. **Ative o módulo**:

   - Vá para Module Settings
   - Encontre "AI Dungeon Master for PF2e"
   - Marque a caixa para ativar

3. **Configure a API Key**:
   - Game Settings → Module Settings
   - "AI Dungeon Master for PF2e"
   - Cole sua chave do Google Gemini

## 🔒 Nota sobre Segurança

⚠️ **IMPORTANTE**: Nunca coloque informações sensíveis em repositórios públicos!

- ✅ OK para tornar público: Código do módulo, documentação, assets
- ❌ NÃO torne público: Chaves de API, senhas, tokens

A chave API do Gemini deve ser configurada apenas nas **settings do Foundry**, não no código!

## 🆘 Precisa de Ajuda?

Se tiver problemas para tornar o repositório público:

1. Verifique se você é o dono do repositório
2. Verifique se tem permissões de administrador
3. Se o repositório faz parte de uma organização, pode precisar de permissões especiais

---

**Próximos passos após tornar público**:

1. Tornar o repositório público no GitHub
2. Verificar o acesso ao manifest
3. Instalar o módulo no Foundry VTT
4. Configurar a chave API do Gemini
5. Começar a usar! 🎲✨

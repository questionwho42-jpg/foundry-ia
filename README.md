# AI Dungeon Master for Pathfinder 2e

Um módulo completo para Foundry Virtual Tabletop que funciona como um assistente de Dungeon Master alimentado por IA, usando a API do Google Gemini e especializado no sistema Pathfinder 2e.

![Foundry VTT](https://img.shields.io/badge/Foundry-v11%20%7C%20v12-orange)
![Sistema](https://img.shields.io/badge/Sistema-Pathfinder%202e-blue)
![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-green)

## 🎲 Funcionalidades

### Chat Interativo com IA
- Converse com uma IA especializada em Pathfinder 2e
- Contexto automático do jogo (cena atual, tokens selecionados, etc.)
- Histórico de conversação mantido durante a sessão
- Comandos de chat rápidos (`/aidm` e `/dm`)

### Geração de Conteúdo
- **Descrições de Cenas**: Gera descrições narrativas ricas e imersivas para suas cenas
- **Criação de NPCs**: Gera NPCs completos com background, personalidade e características mecânicas
- **Ajuda com Regras**: Explica regras do Pathfinder 2e de forma clara e com exemplos

### Integração com Foundry
- Botão de controle de cena para acesso rápido
- Interface intuitiva com múltiplas abas
- Suporte completo a localização (Português e Inglês)
- Configurações flexíveis por mundo

## 📦 Instalação

### Método 1: Via Foundry VTT (Recomendado - quando disponível)

1. No Foundry VTT, vá para **Add-on Modules**
2. Clique em **Install Module**
3. Procure por "AI Dungeon Master"
4. Clique em **Install**

### Método 2: Instalação Manual

1. Baixe a última versão do [GitHub](https://github.com/questionwho42-jpg/foundry-ia/releases)
2. Extraia o arquivo ZIP na pasta `Data/modules` do Foundry VTT
3. Renomeie a pasta para `ai-dungeon-master-pf2e`
4. Reinicie o Foundry VTT
5. Ative o módulo no seu mundo

### Método 3: Via Manifest URL

Use este manifest URL no Foundry:
```
https://raw.githubusercontent.com/questionwho42-jpg/foundry-ia/main/module.json
```

## 🔑 Configuração

### 1. Obter Chave API do Google Gemini

1. Acesse [Google AI Studio](https://ai.google.dev/)
2. Faça login com sua conta Google
3. Clique em "Get API Key"
4. Copie sua chave API

### 2. Configurar no Foundry VTT

1. Abra seu mundo no Foundry VTT
2. Vá para **Game Settings** → **Configure Settings** → **Module Settings**
3. Encontre "AI Dungeon Master for PF2e"
4. Cole sua chave API no campo "Google Gemini API Key"
5. (Opcional) Ajuste outras configurações:
   - **Modelo do Gemini**: Escolha entre Flash (rápido) ou Pro (avançado)
   - **Criatividade (Temperature)**: 0.0-2.0 (padrão: 0.7)
   - **Comprimento Máximo**: Tokens máximos na resposta (padrão: 2048)

## 🎮 Como Usar

### Interface Principal

1. **Para GM**: Clique no botão com ícone de robô nos controles de cena
2. **Via Chat**: Digite `/dm` ou `/aidm` no chat

### Abas da Interface

#### 💬 Chat
- Digite perguntas ou solicitações para a IA
- Receba respostas contextualizadas ao seu jogo
- Histórico completo da conversa

#### 🛠️ Ferramentas
- **Descrever Cena**: Gera descrição narrativa da cena ativa
- **Gerar NPC**: Cria um NPC completo com customização
- **Ajuda com Regras**: Explica mecânicas do PF2e
- **Limpar Conversa**: Reset do histórico

#### ℹ️ Info
- Informações sobre o módulo
- Contexto atual do jogo
- Lista de recursos disponíveis

### Comandos de Chat

```
/aidm Como funciona o sistema de três ações?
/aidm Descreva um taverna medieval sombria
/dm (abre a interface)
```

## 🔧 Configurações Avançadas

### Modelos Disponíveis

- **Gemini 1.5 Flash**: Rápido e econômico, ótimo para uso geral
- **Gemini 1.5 Pro**: Mais capaz, melhor para tarefas complexas
- **Gemini 2.0 Flash Experimental**: Versão experimental mais recente

### Parâmetros de IA

- **Temperature (0-2)**: Controla criatividade
  - 0.3-0.5: Respostas focadas e consistentes
  - 0.7-1.0: Balanceado (recomendado)
  - 1.2-2.0: Mais criativo e variado

- **Max Tokens**: Limite de tamanho da resposta
  - 512: Respostas curtas
  - 2048: Padrão recomendado
  - 4096+: Respostas longas e detalhadas

## 🌍 Idiomas Suportados

- 🇧🇷 Português (Brasil)
- 🇺🇸 English (US)

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 🐛 Reportando Bugs

Encontrou um bug? [Abra uma issue](https://github.com/questionwho42-jpg/foundry-ia/issues) com:

- Descrição detalhada do problema
- Passos para reproduzir
- Versão do Foundry VTT
- Versão do módulo
- Logs do console (F12)

## 📝 Changelog

### v1.0.0 (2025-01-07)
- 🎉 Lançamento inicial
- ✨ Chat interativo com IA
- 🎭 Geração de NPCs
- 🗺️ Descrições de cenas
- 📚 Ajuda com regras PF2e
- 🌍 Suporte PT-BR e EN

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [Foundry VTT](https://foundryvtt.com/) - Plataforma incrível
- [Google Gemini](https://ai.google.dev/) - API de IA
- [Pathfinder 2e System](https://github.com/foundryvtt/pf2e) - Sistema de jogo
- Comunidade Foundry VTT Brasil

## 📧 Contato

- GitHub: [@questionwho42-jpg](https://github.com/questionwho42-jpg)
- Issues: [GitHub Issues](https://github.com/questionwho42-jpg/foundry-ia/issues)

---

**Nota**: Este módulo requer uma chave API do Google Gemini para funcionar. O uso da API pode incorrer em custos dependendo do seu volume de uso. Consulte a [página de preços do Google AI](https://ai.google.dev/pricing) para mais informações.

**Compatibilidade**: Sistema Pathfinder 2e versão 5.0+

Feito com ❤️ para a comunidade de RPG

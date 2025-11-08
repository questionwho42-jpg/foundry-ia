# AI Solo Adventure Narrator for Pathfinder 2e

🎭 **Narrador de Aventuras Solo com IA** - Um módulo completo para Foundry Virtual Tabletop que transforma suas sessões individuais de Pathfinder 2e em aventuras narrativas imersivas usando o **Google Gemini 2.5 Pro**.

![Foundry VTT](https://img.shields.io/badge/Foundry-v11%20%7C%20v12-orange)
![Sistema](https://img.shields.io/badge/Sistema-Pathfinder%202e-blue)
![Gemini](https://img.shields.io/badge/Gemini-2.5%20Pro-purple)
![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-green)

## 🎲 O Que É?

Este módulo é o **mestre perfeito para aventuras solo**. Usando o modelo mais avançado do Google Gemini (2.5 Pro), ele narra histórias completas, interpreta NPCs, descreve cenários vívidos e responde às suas ações em tempo real. É como ter um DM pessoal disponível 24/7!

## ✨ Funcionalidades Principais

### 🎭 Narração Imersiva
- **Narrativa em segunda pessoa** ("você vê", "você sente")
- **Descrições sensoriais ricas** - visão, som, cheiro, tato
- **Estilo adaptativo** - terror, fantasia, mistério, aventura
- **Contexto persistente** - a IA lembra de tudo que aconteceu

### 🎬 Sistema de Aventuras
- **Início personalizado** - escolha tema e cenário inicial
- **6 temas prontos** - fantasia medieval, terror gótico, investigação urbana, exploração de masmorras, mistério e pirataria
- **Progressão natural** - a história evolui baseada nas suas escolhas
- **Sem trilhos** - total liberdade narrativa

### 👥 NPCs Vivos
- **Personalidades únicas** - cada NPC tem voz própria
- **Motivações secretas** - descubra o que realmente querem
- **Backgrounds ricos** - histórias pessoais interessantes
- **Ganchos narrativos** - múltiplas formas de envolvimento

### 🗺️ Descrição de Cenários
- **Atmosfera detalhada** - cada local tem sua personalidade
- **Detalhes interativos** - elementos que convidam à exploração
- **Tensão construída** - ritmo narrativo apropriado

## 🚀 Modelos Disponíveis

### Gemini 2.5 Pro (Recomendado) ⭐
- **Melhor para**: Narrativas complexas e imersivas
- **Força**: Raciocínio avançado, contexto longo (1M tokens)
- **Ideal para**: Aventuras solo com múltiplas sessões

### Gemini 2.5 Flash
- **Melhor para**: Sessões rápidas
- **Força**: Velocidade e eficiência
- **Ideal para**: One-shots e exploração casual

### Gemini 2.5 Flash-Lite
- **Melhor para**: Uso econômico
- **Força**: Custo-benefício
- **Ideal para**: Testes e uso frequente

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

### 1️⃣ Primeira Aventura

1. **Selecione seu personagem** (token no mapa)
2. **Clique no botão do livro** nos controles de cena
3. **Escolha "Iniciar Aventura"**
4. **Selecione**:
   - Tema da aventura (fantasia, terror, mistério, etc.)
   - Cenário inicial (taverna, floresta, cidade, etc.)
5. **A história começa!**

### 2️⃣ Durante a Aventura

**Você faz**: Digite suas ações no chat
```
Examino o mapa antigo na parede
Converso com o taberneiro sobre rumores
Saio pela porta dos fundos silenciosamente
```

**A IA responde**: 
- Descreve o resultado das suas ações
- Narra as consequências
- Apresenta novos desafios
- Oferece escolhas

### 3️⃣ Comandos Rápidos

```
/aidm [sua ação]    - Ação rápida no chat
/dm                 - Abre a interface completa
```

## 🎨 Temas de Aventura

### 🏰 Fantasia Medieval
Reinos clássicos, dragões, magia e cavalaria

### 🦇 Terror Gótico  
Mansões assombradas, vampiros e mistérios sombrios

### 🔍 Investigação Urbana
Crimes, conspirações e intrigas políticas

### ⚔️ Exploração de Masmorras
Ruínas antigas, armadilhas e tesouros perdidos

### 🎭 Mistério e Intriga
Segredos, traições e reviravoltas inesperadas

### ⚓ Alto Mar e Pirataria
Navios piratas, ilhas perdidas e aventuras marítimas

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

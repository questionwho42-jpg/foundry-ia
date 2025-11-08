# 💡 Ideias Futuras - AI Solo Adventure Narrator for PF2e

> **Arquivo de planejamento e roadmap do módulo**
> 
> Este arquivo contém todas as ideias e melhorias sugeridas para o módulo, organizadas por categoria e complexidade.
> Cada ideia inclui um prompt otimizado para implementação e sugestões de personalização.

---

## 📋 Índice

- [Funcionalidades Básicas](#funcionalidades-básicas) (Complexidade: Baixa)
- [Funcionalidades Intermediárias](#funcionalidades-intermediárias) (Complexidade: Média)
- [Funcionalidades Avançadas](#funcionalidades-avançadas) (Complexidade: Alta)
- [Integrações e Expansões](#integrações-e-expansões) (Complexidade: Muito Alta)
- [Funcionalidades Implementadas](#funcionalidades-implementadas)

---

## 🟢 Funcionalidades Básicas
*Complexidade: Baixa | Tempo estimado: 1-3 horas cada*

### 1. Gerador de Tesouros para Cenas

**Descrição:**
Adicionar funcionalidade para gerar tesouros e itens espalhados pela cena de combate. A IA sugere itens apropriados para o nível e local, e o código cria "tokens de item" ou notas na cena indicando onde estão os tesouros.

**Prompt Otimizado para Implementação:**
```
TAREFA: Implementar gerador de tesouros para cenas de combate

CONTEXTO:
- Módulo: AI Solo Adventure Narrator for PF2e
- Arquivo principal: scripts/gemini-api.mjs
- Local de integração: Após criação da cena em ai-dm-app.mjs

REQUISITOS:
1. Adicionar método generateSceneLoot(sceneParams) na classe GeminiAPI
2. IA deve retornar texto simples com:
   - Número de tesouros (1-4)
   - Nome de cada item
   - Localização sugerida (canto, centro, sob móvel, etc)
3. Código deve criar Journal Entries ou Drawing Notes na cena
4. Itens devem ser apropriados para nível do jogador
5. Adicionar checkbox "Incluir Tesouros" no diálogo de criação de cena

PROMPT DA IA:
"Gere tesouros para cena de combate PF2e:
Local: {locationType}
Nível: {playerLevel}

Liste 1-4 tesouros:
- Nome do item
- Localização (ex: canto nordeste, centro da sala)
- Valor aproximado em PO

Seja conciso."

IMPLEMENTAÇÃO:
- Criar método em gemini-api.mjs após generateCombatScene()
- Adicionar opção no Dialog de _onGenerateCombatScene()
- Criar notas de mapa (Drawing Notes) nas posições sugeridas
- Usar ícones de baú/moeda para representar tesouros
```

**Comentários:**
- **Recurso:** Adiciona camada de recompensa e exploração às cenas
- **Alternativa 1:** Usar Tiles com imagem de baú ao invés de notas
- **Alternativa 2:** Criar itens reais no compendium e linkando
- **Alternativa 3:** Usar Tokens invisíveis com notas GM-only

**Personalização do Prompt:**
```markdown
Para mais tesouros: Mude "1-4 tesouros" → "2-6 tesouros"
Para tesouros mágicos: Adicione "Inclua 1 item mágico menor"
Para tesouro específico: Adicione "Tipo preferido: {armas/armaduras/poções/etc}"
Para dificuldade de encontrar: Adicione "DC de Percepção para encontrar"
```

**Nível de Complexidade:** ⭐ Baixa
**Tempo Estimado:** 2 horas

---

### 2. Gerador de Armadilhas Simples

**Descrição:**
Adicionar armadilhas básicas às cenas de combate. A IA sugere tipo de armadilha apropriada ao local, e o código cria marcadores ou tiles representando as armadilhas.

**Prompt Otimizado para Implementação:**
```
TAREFA: Implementar gerador de armadilhas para cenas

CONTEXTO:
- Integração com sistema de cenas existente
- Usar Measured Templates ou Drawing Tools para representar armadilhas

REQUISITOS:
1. Método generateTraps(sceneParams) em GeminiAPI
2. IA retorna:
   - Tipo de armadilha (fosso, dardos, gás, etc)
   - Posição sugerida
   - CD de Percepção para detectar
   - CD de Desabilitar Dispositivos
   - Dano/efeito
3. Criar Measured Templates (círculo vermelho) nas posições
4. Adicionar Journal Entry com detalhes da armadilha
5. Marcar como invisível para jogadores (GM-only)

PROMPT DA IA:
"Armadilhas para cena PF2e:
Local: {locationType}
Nível: {playerLevel}

Sugira 1-2 armadilhas:
- Tipo
- Posição (coordenadas aproximadas)
- CD Percepção
- CD Desabilitar
- Efeito/Dano

Conciso e direto."

IMPLEMENTAÇÃO:
- Adicionar checkbox "Incluir Armadilhas" no diálogo
- Criar MeasuredTemplate com círculo vermelho (raio 1 quadrado)
- Criar Journal Entry linkado ao template
- Template visível apenas para GM
```

**Comentários:**
- **Recurso:** Aumenta desafio tático e recompensa investigação
- **Alternativa 1:** Usar Tiles com ícone de caveira (visível após detecção)
- **Alternativa 2:** Integrar com módulo Monk's Active Tiles para triggers
- **Alternativa 3:** Criar armadilhas como Hazards (actors tipo hazard)

**Personalização do Prompt:**
```markdown
Mais perigoso: "Nível +2 do jogador"
Mais sutil: "Armadilhas muito bem escondidas (CD +5)"
Tipo específico: "Apenas armadilhas mágicas/mecânicas"
Quantidade: Mude "1-2" → "0-3" (pode não ter nenhuma)
```

**Nível de Complexidade:** ⭐⭐ Baixa-Média
**Tempo Estimado:** 3 horas

---

## 🟡 Funcionalidades Intermediárias
*Complexidade: Média | Tempo estimado: 4-8 horas cada*

### 3. Sistema de Eventos Narrativos para Cenas

**Descrição:**
Criar eventos aleatórios que podem ocorrer durante o combate (reforços chegando, estrutura desmoronando, NPC neutro aparecendo, etc.). A IA gera o evento e o GM pode ativá-lo durante a sessão.

**Prompt Otimizado para Implementação:**
```
TAREFA: Implementar sistema de eventos narrativos dinâmicos

CONTEXTO:
- Eventos acontecem durante o combate para criar drama
- GM ativa manualmente ou por timer/trigger
- Eventos podem ajudar/atrapalhar ambos os lados

REQUISITOS:
1. Método generateSceneEvents(sceneParams) em GeminiAPI
2. IA gera 3-5 eventos possíveis:
   - Descrição do evento (1-2 frases)
   - Efeito mecânico (buff/debuff, reforços, terreno)
   - Gatilho sugerido (turno X, HP baixo, etc)
3. Criar Macro para cada evento no compendium
4. Adicionar Chat Card com botão "Ativar Evento"
5. Journal Entry com todos os eventos disponíveis

PROMPT DA IA:
"Eventos narrativos para combate PF2e:
Local: {locationType}
Tipo de combate: {enemyTypes}

Gere 3 eventos dinâmicos:
- Nome curto
- Descrição (2 frases)
- Efeito mecânico (ex: todos ganham Cover, reforço de 1 inimigo)
- Quando ocorre (ex: turno 3, quando alguém fica abaixo de 50% HP)

Seja criativo e cinematográfico."

IMPLEMENTAÇÃO:
- Gerar eventos junto com a cena
- Criar Journal Entry "Eventos - {SceneName}"
- Criar Macros ativando efeitos (aplicar condições, spawnar tokens)
- Chat Card com lista de eventos + botões
- Opcionalmente: Timer automático usando Foundry hooks
```

**Comentários:**
- **Recurso:** Torna combates mais dinâmicos e imprevisíveis
- **Alternativa 1:** Integrar com módulo Monk's Active Tiles para triggers automáticos
- **Alternativa 2:** Usar Simple Calendar para eventos em tempo específico
- **Alternativa 3:** Criar rolltable de eventos aleatórios (rolar 1d6)

**Personalização do Prompt:**
```markdown
Mais eventos: "Gere 5-7 eventos"
Tom específico: Adicione "Tom: sombrio/heroico/cômico"
Complexidade: "Eventos simples" ou "Eventos complexos com múltiplos efeitos"
Frequência: "Evento a cada 2 turnos" ou "Eventos raros"
Tipo: "Apenas eventos ambientais" ou "Apenas sociais/NPCs"
```

**Nível de Complexidade:** ⭐⭐⭐ Média
**Tempo Estimado:** 6 horas

---

### 4. Gerador de Diálogos e Interações Sociais

**Descrição:**
Gerar opções de diálogo e negociação para NPCs, permitindo resolver encontros sem combate. A IA cria personalidade, motivações e possíveis acordos.

**Prompt Otimizado para Implementação:**
```
TAREFA: Sistema de diálogos dinâmicos para NPCs

CONTEXTO:
- Permite resolução diplomática de encontros
- NPCs têm motivações e podem ser convencidos
- Sistema de skill checks (Diplomacia, Intimidação, Engano)

REQUISITOS:
1. Método generateNPCDialogue(npcData, context) em GeminiAPI
2. IA gera:
   - 3-4 opções de abertura de diálogo
   - Reações possíveis do NPC
   - Condições para sucesso (DCs de perícias)
   - Possíveis acordos/concessões
3. Interface de diálogo no chat ou dialog box
4. Rastrear atitude do NPC (hostil → amigável)
5. Resolver encontro sem combate se bem-sucedido

PROMPT DA IA:
"Diálogos para NPC em PF2e:
NPC: {npcName}
Contexto: {situação atual}
Nível: {level}

Gere opções de interação:
1. Abordagem diplomática (DC {X})
2. Abordagem intimidadora (DC {Y})
3. Abordagem enganosa (DC {Z})

Para cada uma:
- Fala do jogador (exemplo)
- Reação do NPC
- Resultado se sucesso/falha

Seja conciso mas impactante."

IMPLEMENTAÇÃO:
- Adicionar botão "Tentar Diálogo" na ficha de NPC
- Chat Card com opções numeradas
- Botões para rolar perícia apropriada
- Atualizar sheet do NPC com "disposition" (attitude)
- Se attitude ≥ amigável: oferecer resolver sem combate
```

**Comentários:**
- **Recurso:** Adiciona profundidade roleplay e alternativas ao combate
- **Alternativa 1:** Integrar com módulo Dice So Nice para rolls dramáticos
- **Alternativa 2:** Usar Foundry's ActiveEffect para rastrear attitude
- **Alternativa 3:** Sistema de "pontos de conversa" acumulativos

**Personalização do Prompt:**
```markdown
Mais opções: "Gere 5-6 opções diferentes"
Tom: "Tom formal/casual/agressivo"
Detalhamento: "Incluir linguagem corporal e tom de voz"
Consequências: "Mostrar consequências de longo prazo de cada escolha"
```

**Nível de Complexidade:** ⭐⭐⭐ Média-Alta
**Tempo Estimado:** 8 horas

---

## 🔴 Funcionalidades Avançadas
*Complexidade: Alta | Tempo estimado: 12+ horas cada*

### 5. Sistema de Campanha Persistente

**Descrição:**
Criar sistema que mantém continuidade entre sessões: NPCs lembram interações passadas, escolhas têm consequências, mundo evolui baseado nas ações do jogador.

**Prompt Otimizado para Implementação:**
```
TAREFA: Implementar sistema de memória persistente e consequências

CONTEXTO:
- Armazenar histórico de ações, escolhas e interações
- NPCs referenciarem eventos passados
- Mundo muda baseado nas escolhas do jogador

REQUISITOS:
1. Banco de dados JSON armazenando:
   - Encontros passados
   - NPCs conhecidos e relações
   - Escolhas importantes
   - Missões completadas/falhadas
   - Reputação por facção
2. Método generateContextualNarrative(history) em GeminiAPI
3. IA usa histórico para gerar narrativas consistentes
4. Journal Entry "Diário de Campanha" auto-atualizado
5. UI para visualizar timeline de eventos

PROMPT DA IA:
"Narrativa contextual PF2e baseada em histórico:

HISTÓRICO:
{resumo de eventos passados}

SITUAÇÃO ATUAL:
{contexto imediato}

Gere:
- Referências sutis a eventos passados
- Consequências das escolhas anteriores
- NPCs reagindo à reputação do jogador
- Gancho narrativo conectando ao histórico

Mantenha consistência e continuidade."

IMPLEMENTAÇÃO:
- Criar WorldData storage para histórico
- Hook em Actor.create, Scene.view, Item.use para registrar eventos
- Método addToHistory(event) em classe CampaignManager
- IA recebe contexto histórico em cada request
- UI tab "Campanha" mostrando timeline
- Export/import de campanha para backup
```

**Comentários:**
- **Recurso:** Transforma sessões isoladas em campanha épica contínua
- **Alternativa 1:** Usar módulo Simple Calendar para timeline visual
- **Alternativa 2:** Integrar com módulo Quest Log para rastrear missões
- **Alternativa 3:** Sistema de "karma" influenciando eventos futuros

**Personalização do Prompt:**
```markdown
Profundidade: "Apenas eventos maiores" ou "Rastrear tudo incluindo diálogos"
Memória NPC: "NPCs lembram perfeitamente" ou "NPCs esquecem com tempo"
Consequências: "Imediatas" ou "Aparecem após várias sessões"
Ramificações: "Linear" ou "Múltiplas linhas temporais alternativas"
```

**Nível de Complexidade:** ⭐⭐⭐⭐⭐ Muito Alta
**Tempo Estimado:** 20+ horas

---

### 6. Gerador de Dungeons Multi-Sala

**Descrição:**
Expandir gerador de cena para criar dungeons completas com múltiplas salas conectadas, corredores, segredos, e progressão lógica.

**Prompt Otimizado para Implementação:**
```
TAREFA: Sistema de geração procedural de dungeons

CONTEXTO:
- Criar múltiplas cenas conectadas formando dungeon
- Mapa lógico: entrada → salas → boss final
- Segredos opcionais e caminhos alternativos

REQUISITOS:
1. Método generateDungeon(dungeonParams) em GeminiAPI
2. Algoritmo de geração de layout (room-corridor-room)
3. IA gera temas e conteúdo de cada sala:
   - Descrição ambiental
   - Encontros (combate/puzzle/social)
   - Tesouros e segredos
   - Conexões entre salas
4. Criar múltiplas Scenes linkadas
5. Scene Links automáticos (portas teleportando entre salas)
6. Mapa de visão geral no Journal

PROMPT DA IA:
"Dungeon PF2e com {numRooms} salas:
Tema: {theme}
Nível: {level}
Boss final: {bossType}

Para cada sala gere:
- Nome
- Descrição (2 frases)
- Tipo (combate/puzzle/vazia/tesouro)
- Conexões (norte/sul/leste/oeste)
- Conteúdo específico

Layout deve fazer sentido narrativo."

IMPLEMENTAÇÃO:
- Algoritmo de geração de graph (salas = nodes, portas = edges)
- Criar Scene para cada sala
- Drawing Tools para portas (com links entre scenes)
- Journal Entry "Mapa do Dungeon" com overview
- Navegação: clicar em porta → scene.view(nextRoom)
- Boss sempre na sala mais distante da entrada
```

**Comentários:**
- **Recurso:** Gera dungeons exploráveis completas automaticamente
- **Alternativa 1:** Usar Walls para desenhar layout em uma única cena gigante
- **Alternativa 2:** Integrar com módulo Levels para dungeons multi-andar
- **Alternativa 3:** Importar templates de dungeon e popular com IA

**Personalização do Prompt:**
```markdown
Tamanho: "Pequena (3-5 salas)" ou "Grande (10-15 salas)"
Complexidade: "Linear" ou "Labiríntico com loops"
Segredos: "1 sala secreta" ou "Múltiplos caminhos ocultos"
Estilo: "Clássica D&D" ou "Orgânica (cavernas)" ou "Arquitetônica (castelo)"
```

**Nível de Complexidade:** ⭐⭐⭐⭐⭐ Muito Alta
**Tempo Estimado:** 30+ horas

---

## 🔵 Integrações e Expansões
*Complexidade: Muito Alta | Tempo estimado: 15+ horas cada*

### 7. Integração com Stable Diffusion para Geração de Mapas

**Descrição:**
Integrar com API de geração de imagens (Stable Diffusion/DALL-E) para criar mapas visuais reais, não apenas descrições textuais.

**Prompt Otimizado para Implementação:**
```
TAREFA: Integrar geração de imagens de mapa via API

CONTEXTO:
- Gemini descreve mapa → Stable Diffusion gera imagem
- Baixar imagem e setar como background da cena
- Overlay de grid sobre a imagem

REQUISITOS:
1. Configuração de API key para Stable Diffusion/DALL-E
2. Método generateMapImage(sceneDescription) em GeminiAPI
3. Conversão de descrição → prompt de imagem otimizado
4. Download e salvamento da imagem em Foundry data
5. Aplicar como Tile background na cena
6. Opção para regenerar se usuário não gostar

PROMPT PARA STABLE DIFFUSION:
"Top-down battle map for tabletop RPG, 
{sceneDescription}, 
grid overlay, dungeon tiles style, 
high contrast, clear details, 
suitable for D&D/Pathfinder, 
4k resolution, square grid visible"

IMPLEMENTAÇÃO:
- Setting para API key (Stable Diffusion/DALL-E/etc)
- Checkbox "Gerar Imagem de Mapa" no diálogo
- Aguardar geração (loading indicator)
- Salvar em foundry-data/ai-generated-maps/
- Criar Tile com a imagem como background
- Botão "Regenerar Mapa" se não gostar
```

**Comentários:**
- **Recurso:** Mapas visualmente impressionantes automaticamente
- **Custos:** DALL-E ~$0.04/imagem | Stable Diffusion API variável
- **Alternativa 1:** Usar Hugging Face (gratuito mas lento)
- **Alternativa 2:** Stable Diffusion local (requer GPU potente)
- **Alternativa 3:** Banco de tiles pré-feitos montados proceduralmente

**Personalização do Prompt:**
```markdown
Estilo: Adicione "pixel art" ou "photorealistic" ou "watercolor"
Qualidade: "512x512 (rápido)" ou "1024x1024 (detalhado)"
Variações: Gerar 2-3 opções e deixar escolher
Provider: "DALL-E 3" ou "Midjourney" ou "Stable Diffusion"
```

**Nível de Complexidade:** ⭐⭐⭐⭐⭐ Muito Alta
**Tempo Estimado:** 15 horas

---

### 8. Sistema de Combate Automático (AI vs AI)

**Descrição:**
IA controla os inimigos durante combate, fazendo escolhas táticas inteligentes (movimento, ações, alvos). Jogador só precisa controlar seu personagem.

**Prompt Otimizado para Implementação:**
```
TAREFA: IA tática para controlar NPCs inimigos

CONTEXTO:
- A cada turno de NPC, IA decide melhor ação
- Considera posição, HP, habilidades disponíveis
- Joga para vencer mas mantém desafio balanceado

REQUISITOS:
1. Método decideNPCAction(npcToken, combatState) em GeminiAPI
2. IA analisa:
   - Posição de todos (aliados e inimigos)
   - HP atual
   - Ações disponíveis
   - Recursos restantes
3. Retorna decisão:
   - Movimento (coordenadas)
   - Ação (ataque/spell/habilidade especial)
   - Alvo
4. Executar automaticamente quando turno do NPC
5. Mostrar no chat o "pensamento" da IA (opcional)

PROMPT DA IA:
"Decisão tática para NPC PF2e:

NPC: {npcName} (HP: {current}/{max})
Posição: {x}, {y}
Ações: {listaDeAções}

ESTADO DO COMBATE:
Aliados: {posições e HP dos aliados}
Inimigos: {posições e HP dos inimigos}

Decida:
- Mover para: (x, y) ou ficar
- Usar ação: {nomeAção}
- Alvo: {nomeAlvo}
- Justificativa (1 frase)

Seja tático mas não perfeito."

IMPLEMENTAÇÃO:
- Hook em Combat.nextTurn
- Se token é NPC: chamar decideNPCAction()
- Executar movimento: token.update({x, y})
- Executar ação: simular click em action/spell
- Aplicar dano/efeitos automaticamente
- Chat message com decisão tomada
```

**Comentários:**
- **Recurso:** Solo play verdadeiramente autônomo
- **Desafios:** Executar ações via API do Foundry é complexo
- **Alternativa 1:** Apenas sugerir ação (GM executa manualmente)
- **Alternativa 2:** Integrar com módulo Combat Utility Belt
- **Alternativa 3:** Sistema simplificado (apenas ataques básicos auto)

**Personalização do Prompt:**
```markdown
Dificuldade: "IA burra (escolhas aleatórias)" ou "IA mestre (otimizada)"
Personalidade: Adicione "Este NPC é covarde" ou "agressivo" ou "cauteloso"
Complexidade: "Apenas ataques básicos" ou "Use todas as habilidades"
Explicação: "Justifique detalhadamente" ou "Sem explicação"
```

**Nível de Complexidade:** ⭐⭐⭐⭐⭐ Muito Alta
**Tempo Estimado:** 25+ horas

---

## ✅ Funcionalidades Implementadas

### Geração Automática de NPCs
**Data:** 08/11/2025
**Branch:** main
**Commit:** 08304ec

**Descrição Original:**
Sistema de geração de NPCs balanceados para jogador solo, incluindo nome, aparência, personalidade e equipamentos sugeridos.

**Implementação:**
- IA gera NPCs com nível ajustado (playerLevel - 1)
- Cria ficha de ator automaticamente no Foundry
- Lista equipamentos apropriados para o nível
- Abre ficha automaticamente após criação

---

### Geração Automática de Cenas de Combate
**Data:** 08/11/2025
**Branch:** main
**Commit:** 2adb7a9

**Descrição Original:**
Sistema de geração de cenas de combate completas com paredes, iluminação, e inimigos posicionados.

**Implementação:**
- IA gera nome, descrição e nomes de inimigos
- Código cria estrutura proceduralmente:
  - Sala retangular 20x15 quadrados
  - Paredes ao redor
  - 4 tochas nos cantos (iluminação animada)
  - Inimigos distribuídos em círculo
- Cena ativada automaticamente
- Configurável: tipo de local, nível, número de inimigos, dificuldade

---

## 📝 Comandos para Atualizar Este Arquivo

```bash
# Adicionar nova ideia (copie o template abaixo e edite)
# Categoria: Básica/Intermediária/Avançada/Integração
# Adicione na seção apropriada acima

# Marcar ideia como implementada
# 1. Recorte a seção da ideia da categoria atual
# 2. Cole em "Funcionalidades Implementadas" com data e commit
# 3. Atualize a data e branch

# Exemplo de template para nova ideia:
```

### X. Nome da Funcionalidade

**Descrição:**
[Descreva o que a funcionalidade faz]

**Prompt Otimizado para Implementação:**
```
TAREFA: [Título conciso]

CONTEXTO:
[Onde se encaixa no código]

REQUISITOS:
1. [Requisito 1]
2. [Requisito 2]

PROMPT DA IA:
"[Prompt otimizado]"

IMPLEMENTAÇÃO:
[Passos de implementação]
```

**Comentários:**
- **Recurso:** [Valor que adiciona]
- **Alternativa 1:** [Abordagem diferente]

**Personalização do Prompt:**
```markdown
[Como customizar]
```

**Nível de Complexidade:** ⭐ [1-5 estrelas]
**Tempo Estimado:** [X horas]

---

## 🎯 Roadmap Sugerido

**Fase 1 - Melhorias Imediatas** (Próximas 2 semanas)
1. Gerador de Tesouros
2. Gerador de Armadilhas Simples

**Fase 2 - Expansão de Gameplay** (Próximo mês)
3. Sistema de Eventos Narrativos
4. Gerador de Diálogos

**Fase 3 - Profundidade** (2-3 meses)
5. Sistema de Campanha Persistente
6. Gerador de Dungeons Multi-Sala

**Fase 4 - Integração Avançada** (Longo prazo)
7. Integração com Geração de Imagens
8. Sistema de Combate Automático

---

**Última atualização:** 08/11/2025
**Versão do módulo:** 1.0.0
**Mantenedor:** questionwho42-jpg

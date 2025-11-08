# Sistema de IA Tática - Implementação Completa

##  Status: Fase 1 Concluída (Sugestões com Botões)

### Arquivos Criados/Modificados

1. **COMBAT-API-RESEARCH.md** - Documentação completa da API
2. **scripts/gemini-api.mjs** - Adicionado decideNPCAction()
3. **scripts/combat-ai.mjs** - Sistema completo de IA tática
4. **scripts/main.mjs** - Integração e inicialização

### Funcionalidades Implementadas

#### 1. Detecção Automática de Turnos de NPCs
- Hook combatTurn detecta quando é turno de um NPC inimigo
- Aguarda 1 segundo para parecer natural
- Coleta estado do combate (aliados e inimigos)

#### 2. Decisão Tática da IA (Gemini)
**Método**: GeminiAPI.decideNPCAction(npcToken, combatState)

**Analisa**:
- HP atual do NPC e dos inimigos
- Posições no grid (distâncias)
- AC dos inimigos
- Ações disponíveis (strikes)
- Aliados próximos

**Retorna**:
\\\javascript
{
  movement: "aproximar do Guerreiro" ou "(5, 10)" ou "ficar",
  action: "Mordida" ou "Garra",
  target: "Guerreiro" ou "Mago",
  reasoning: "Explicação tática da decisão"
}
\\\

#### 3. Card de Sugestão no Chat
**Visual**: Borda marrom, fundo bege
**Conteúdo**:
-  Raciocínio da IA
-  Movimento sugerido
-  Ação sugerida
-  Alvo sugerido

**Botões** (3):
1.  **Mover** (azul) - Executa apenas movimento
2.  **Atacar** (vermelho) - Executa apenas ataque
3.  **Executar Tudo** (verde) - Movimento + Ataque

#### 4. Execução de Movimento
**Método**: CombatAI.executeMove(token, decision, combatState)

**Suporta**:
- \"ficar"\ - Permanece na posição
- \"aproximar do [Nome]"\ - Move para adjacente ao alvo
- \"(X, Y)"\ - Move para coordenadas específicas do grid

**Animação**: 1 segundo de transição suave

#### 5. Execução de Ataque
**Método**: CombatAI.executeAttack(token, decision, combatState)

**Processo**:
1. Localiza action em \
pc.system.actions\ pelo nome
2. Encontra token do alvo pelos inimigos mapeados
3. Executa \strike.attack()\ ou \ariant.roll()\
4. Sistema PF2e resolve rolagem e dano automaticamente

#### 6. Event Handlers
**jQuery**: Listeners em \.ai-action-btn\
**Armazenamento**: \game.aiCombat[tokenId]\ guarda decisão
**Desabilitar**: Botões ficam desabilitados após clique

#### 7. Automação Total (Modo Future-Proof)
**Método**: \CombatAI.executeDecision()\
- Executa movimento automaticamente
- Aguarda 1.5s (animação)
- Executa ataque automaticamente
- Notificação de conclusão

### Como Usar

#### Configuração Inicial
1. Abra o Foundry VTT v13
2. Habilite o módulo "AI Dungeon Master PF2e"
3. Configure sua API key do Gemini nas settings
4. Sistema carrega automaticamente

#### Durante o Combate
1. Inicie um combate tracker
2. Quando for turno de um NPC inimigo (disposition -1):
   - Sistema detecta automaticamente
   - IA analisa situação tática
   - Card de sugestão aparece no chat
3. GM clica em um dos 3 botões:
   - **Mover**: Só movimento
   - **Atacar**: Só ataque
   - **Executar Tudo**: Ambos

#### Modo Manual (Desabilitado)
\\\javascript
game.combatAI.setAutomationLevel('off');
\\\

#### Modo Sugestões (Padrão)
\\\javascript
game.combatAI.setAutomationLevel('suggestions');
\\\

#### Modo Automação Total (Futuro)
\\\javascript
game.combatAI.setAutomationLevel('full');
\\\

### Próximas Fases

#### Fase 2: Interface de Configuração (Task 7)
- [ ] Game setting com 3 opções (Off/Suggestions/Full)
- [ ] Menu nas configurações do módulo
- [ ] Atalho de teclado para alternar

#### Fase 3: Habilidades Avançadas (Task 8)
- [ ] Suporte a magias (spellcasting)
- [ ] Habilidades especiais (special abilities)
- [ ] Condições de status (frightened, stunned, etc)
- [ ] Ações de 3 ações (3-action activities)

### Testes Necessários

1. **Combate Básico**:
   - Criar scene com 2 PCs e 2 NPCs
   - Iniciar combate
   - Verificar se IA sugere ações

2. **Movimento**:
   - Testar "aproximar"
   - Testar "ficar"
   - Testar coordenadas

3. **Ataque**:
   - NPCs com múltiplas strikes
   - Verificar rolagens no chat
   - Validar aplicação de dano

4. **Edge Cases**:
   - NPC sem ações disponíveis
   - Todos inimigos mortos
   - NPC sozinho vs múltiplos PCs

### Logs para Debugging

\\\javascript
// Verificar inicialização
console.log(game.combatAI);

// Ver decisões armazenadas
console.log(game.aiCombat);

// Ver ações de um NPC
const npc = canvas.tokens.controlled[0].actor;
console.log(npc.system.actions);
\\\

### Arquitetura do Sistema

\\\
Foundry Combat Tracker
        
    combatTurn hook
        
CombatAI.handleNPCTurn()
        
    getCombatState()  coleta dados
        
GeminiAPI.decideNPCAction()  IA decide
        
CombatAI.showSuggestionCard()  exibe no chat
        
    GM clica botão
        
jQuery event handler  recupera de game.aiCombat
        
executeMove() e/ou executeAttack()
        
    Foundry atualiza tokens/HP
\\\

### Parâmetros da IA

- **Model**: gemini-2.0-flash-exp
- **Temperature**: 0.7 (variação natural)
- **Prompt**: Análise tática em português
- **Context**: HP, AC, posições, distâncias, ações

### Performance

- Latência API: ~1-3 segundos
- Animação movimento: 1 segundo
- Delay entre ações: 1.5 segundos
- Total por turno: ~4-6 segundos

---

**Desenvolvido por**: AI Dungeon Master Development Team
**Data**: 2025-11-08
**Versão**: 1.0.0 (Fase 1 - Sugestões)

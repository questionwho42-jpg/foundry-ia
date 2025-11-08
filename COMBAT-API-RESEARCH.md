# Pesquisa: API de Combate PF2e e Foundry VTT

## Hooks Disponíveis

### Combat Hooks (Foundry Core)
- \combatStart\ - Quando combate começa
- \combatTurn\ - Quando turno muda
- \combatRound\ - Quando round muda
- \updateCombat\ - Quando combate é atualizado
- \deleteCombat\ - Quando combate termina

### Como Usar
\\\javascript
Hooks.on('combatTurn', async (combat, updateData, updateOptions) => {
  const currentCombatant = combat.combatant;
  const token = currentCombatant.token;
  
  // Verificar se é NPC
  if (token.actor.type === 'npc') {
    // Chamar IA
  }
});
\\\

## Estrutura do Combat

### Acessar combate ativo
\\\javascript
const combat = game.combat;
const currentCombatant = combat.combatant;
const allCombatants = combat.combatants;
\\\

### Informações do Combatant
\\\javascript
{
  _id: 'string',
  tokenId: 'string',
  actorId: 'string',
  initiative: 20,
  token: TokenDocument,
  actor: Actor
}
\\\

## Ações e Habilidades PF2e

### Listar ações de um NPC
\\\javascript
const npc = token.actor;

// Ataques (strikes)
const strikes = npc.system.actions || [];

// Todas as ações
const actions = npc.items.filter(i => i.type === 'action');

// Spells
const spells = npc.items.filter(i => i.type === 'spell');

// Exemplo de strike
{
  label: 'Jaws',
  type: 'strike',
  glyph: 'A',  // 1 action
  weapon: {...},
  variants: [...],  // MAP variants
}
\\\

### Executar Ataque
\\\javascript
// PF2e tem sistema próprio de strikes
const strike = npc.system.actions[0];

// Roll de ataque
const attackRoll = await strike.attack({
  target: targetToken.actor
});

// Roll de dano (se acertou)
if (attackRoll.degreeOfSuccess > 0) {
  const damageRoll = await strike.damage({
    target: targetToken.actor
  });
}
\\\

## Movimento de Token

### Mover token
\\\javascript
await token.document.update({
  x: newX,
  y: newY
});

// Com animação
await token.document.update(
  { x: newX, y: newY },
  { animate: true, animation: { duration: 500 } }
);
\\\

### Calcular distância
\\\javascript
const distance = canvas.grid.measureDistance(
  { x: token.x, y: token.y },
  { x: target.x, y: target.y }
);
\\\

## Informações de HP e Status

### HP atual
\\\javascript
const hp = actor.system.attributes.hp;
// { value: 25, max: 50, temp: 0 }
\\\

### AC
\\\javascript
const ac = actor.system.attributes.ac.value;
\\\

### Condições
\\\javascript
const conditions = actor.conditions;
// Ex: blinded, prone, unconscious
\\\

## Estado do Campo de Batalha

### Todos os tokens na cena
\\\javascript
const allTokens = canvas.tokens.placeables;

// Tokens amigos
const allies = allTokens.filter(t => 
  t.document.disposition === currentToken.document.disposition
);

// Tokens inimigos
const enemies = allTokens.filter(t => 
  t.document.disposition === -currentToken.document.disposition
);
\\\

### Verificar linha de visão
\\\javascript
const hasLOS = canvas.effects.visibility.testVisibility(
  targetToken.center,
  { object: currentToken }
);
\\\

## Próximos Passos

1. Testar hooks no console do Foundry
2. Criar método para coletar estado do combate
3. Formatar prompt para IA
4. Implementar parsing da resposta da IA
5. Executar ações sugeridas


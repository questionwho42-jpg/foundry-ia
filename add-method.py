import re

# Ler arquivo
with open('scripts/gemini-api.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

# Verificar se método já existe
if 'decideNPCAction' in content:
    print('❌ Método decideNPCAction já existe!')
    exit(0)

# Método a adicionar
new_method = '''
  /**
   * Decide ação tática para um NPC em combate
   * @param {Object} npcTokenDoc - TokenDocument do NPC
   * @param {Object} combatState - Estado do combate (allies, enemies)
   * @returns {Promise<Object>} Decisão tática {movement, action, target, reasoning}
   */
  async decideNPCAction(npcTokenDoc, combatState) {
    const npc = npcTokenDoc.actor;
    const { allies, enemies } = combatState;

    // Construir prompt tático
    const prompt = `Você é um mestre tático de Pathfinder 2e. Analise e decida a melhor ação para este NPC:

**NPC**: ${npc.name}
**HP**: ${npc.system.attributes.hp.value}/${npc.system.attributes.hp.max}
**CA**: ${npc.system.attributes.ac.value}

**Ações disponíveis**:
${npc.system.actions?.map(a => `- ${a.name}`).join('\\n') || '- Ataque básico'}

**Aliados** (${allies.length}):
${allies.map(a => `- ${a.name}: ${a.distance} quadrados`).join('\\n') || 'Nenhum'}

**Inimigos** (${enemies.length}):
${enemies.map(e => `- ${e.name}: ${e.distance} quadrados, HP: ${e.hp.value}/${e.hp.max}`).join('\\n')}

**Regras PF2e**:
- 3 ações por turno
- Movimento: 1 ação
- Ataque adjacente (1 quadrado)

**Responda APENAS com JSON** (sem markdown):
{
  "movement": "aproximar [nome]" ou "ficar",
  "action": "atacar",
  "target": "[nome do alvo]",
  "reasoning": "explicação breve"
}`;

    const response = await this.chat(prompt, {
      temperature: 0.7,
      maxTokens: 500,
      resetHistory: true
    });

    try {
      // Limpar resposta
      let jsonStr = response.trim();
      if (jsonStr.includes('```')) {
        jsonStr = jsonStr.replace(/```json?\\n?/g, '').replace(/```/g, '').trim();
      }

      const decision = JSON.parse(jsonStr);
      
      return {
        movement: decision.movement || 'ficar',
        action: decision.action || 'atacar',
        target: decision.target || enemies[0]?.name,
        reasoning: decision.reasoning || 'Decisão tática padrão'
      };
    } catch (error) {
      console.error('Combat AI | Erro ao parsear:', error);
      
      // Fallback
      const closest = enemies[0];
      return {
        movement: closest?.distance > 1 ? `aproximar ${closest.name}` : 'ficar',
        action: 'atacar',
        target: closest?.name || 'inimigo',
        reasoning: 'Atacar inimigo mais próximo'
      };
    }
  }
'''

# Encontrar o final da classe (último })
last_brace = content.rfind('}')

# Inserir novo método antes do último }
new_content = content[:last_brace] + new_method + '\n' + content[last_brace:]

# Salvar
with open('scripts/gemini-api.mjs', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('✅ Método decideNPCAction adicionado com sucesso!')

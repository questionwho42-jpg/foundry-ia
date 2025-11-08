/**
 * Sistema de IA Tática para Combate
 * Controla NPCs em combate com decisões inteligentes
 */

export class CombatAI {
  constructor(geminiAPI) {
    this.gemini = geminiAPI;
    this.automationLevel = "suggestions"; // 'off', 'suggestions', 'full'
  }

  /**
   * Inicializa hooks de combate
   */
  initialize() {
    console.log("Combat AI | Inicializando sistema de IA tática...");

    // Hook quando turno muda
    Hooks.on("combatTurn", async (combat, updateData, updateOptions) => {
      if (!game.user.isGM) return; // Apenas GM executa
      if (this.automationLevel === "off") return;

      const currentCombatant = combat.combatant;
      if (!currentCombatant) return;

      const token = currentCombatant.token;
      if (!token) return;

      console.log(`Combat AI | Turno mudou para: ${token.name}, tipo: ${token.actor.type}, disposition: ${token.document.disposition}`);

      // Verificar se é NPC inimigo
      if (token.actor.type === "npc" && token.document.disposition === -1) {
        console.log(`Combat AI | ✓ Turno do NPC inimigo detectado: ${token.name}`);

        // Aguardar um pouco para não parecer instantâneo
        await new Promise((resolve) => setTimeout(resolve, 1000));

        try {
          await this.handleNPCTurn(token, combat);
        } catch (error) {
          console.error("Combat AI | Erro ao processar turno do NPC:", error);
          ui.notifications.error(`Erro na IA tática: ${error.message}`);
        }
      }
    });

    // Event listener para botões das sugestões
    $(document).on("click", ".ai-action-btn", async (event) => {
      if (!game.user.isGM) return;

      const button = $(event.currentTarget);
      const action = button.data("action");
      const tokenId = button.data("token-id");

      // Recuperar decisão armazenada
      const storedData = game.aiCombat?.[tokenId];
      if (!storedData) {
        ui.notifications.warn("Dados da decisão não encontrados");
        return;
      }

      const token = canvas.tokens.get(tokenId);
      if (!token) {
        ui.notifications.error("Token não encontrado");
        return;
      }

      try {
        switch (action) {
          case "move":
            await this.executeMove(
              token,
              storedData.decision,
              storedData.combatState
            );
            break;
          case "attack":
            await this.executeAttack(
              token,
              storedData.decision,
              storedData.combatState
            );
            break;
          case "execute-all":
            await this.executeMove(
              token,
              storedData.decision,
              storedData.combatState
            );
            await this.executeAttack(
              token,
              storedData.decision,
              storedData.combatState
            );
            break;
        }

        // Desabilitar botões após execução
        button
          .closest(".ai-combat-suggestion")
          .find(".ai-action-btn")
          .prop("disabled", true)
          .css("opacity", "0.5");
      } catch (error) {
        console.error("Combat AI | Erro ao executar ação:", error);
        ui.notifications.error(`Erro ao executar ação: ${error.message}`);
      }
    });

    console.log("Combat AI | Sistema inicializado!");
  }

  /**
   * Processa turno de um NPC
   */
  async handleNPCTurn(npcToken, combat) {
    ui.notifications.info(`IA analisando ações para ${npcToken.name}...`);

    // Coletar estado do combate
    const combatState = this.getCombatState(npcToken, combat);

    // IA decide ação
    const decision = await this.gemini.decideNPCAction(npcToken, combatState);

    console.log("Combat AI | Decisão da IA:", decision);

    // Exibir sugestão com botões
    if (this.automationLevel === "suggestions") {
      await this.showSuggestionCard(npcToken, decision, combatState);
    } else if (this.automationLevel === "full") {
      await this.executeDecision(npcToken, decision, combatState);
    }
  }

  /**
   * Coleta informações do estado atual do combate
   */
  getCombatState(npcToken, combat) {
    const allTokens = canvas.tokens.placeables;
    const npcDisposition = npcToken.document.disposition;

    // Aliados (mesma disposição)
    const allies = allTokens
      .filter(
        (t) =>
          t.id !== npcToken.id &&
          t.document.disposition === npcDisposition &&
          t.actor.system.attributes.hp.value > 0
      )
      .map((t) => ({
        name: t.name,
        token: t,
        hp: t.actor.system.attributes.hp,
        gridX: Math.floor(t.x / 100),
        gridY: Math.floor(t.y / 100),
        distance: Math.floor(
          canvas.grid.measureDistance(
            { x: npcToken.x, y: npcToken.y },
            { x: t.x, y: t.y }
          ) / 5
        ), // Converter para quadrados (5ft)
      }));

    // Inimigos (disposição oposta)
    const enemies = allTokens
      .filter(
        (t) =>
          t.document.disposition === -npcDisposition &&
          t.actor.system.attributes.hp.value > 0
      )
      .map((t) => ({
        name: t.name,
        token: t,
        hp: t.actor.system.attributes.hp,
        ac: t.actor.system.attributes.ac.value,
        gridX: Math.floor(t.x / 100),
        gridY: Math.floor(t.y / 100),
        distance: Math.floor(
          canvas.grid.measureDistance(
            { x: npcToken.x, y: npcToken.y },
            { x: t.x, y: t.y }
          ) / 5
        ),
      }))
      .sort((a, b) => a.distance - b.distance); // Ordenar por distância

    return { allies, enemies };
  }

  /**
   * Exibe card com sugestões e botões
   */
  async showSuggestionCard(npcToken, decision, combatState) {
    const content = `
      <div class="ai-combat-suggestion" style="border: 2px solid #8B4513; padding: 10px; background: #f5f5dc;">
        <h3 style="margin-top: 0; color: #8B4513;">
          <i class="fas fa-brain"></i> IA Tática: ${npcToken.name}
        </h3>
        
        <div style="margin: 10px 0;">
          <strong>💭 Raciocínio:</strong> ${decision.reasoning}
        </div>

        <div style="background: white; padding: 8px; margin: 10px 0; border-left: 3px solid #4682B4;">
          <div><strong>🚶 Movimento:</strong> ${decision.movement}</div>
          <div><strong>⚔️ Ação:</strong> ${decision.action}</div>
          <div><strong>🎯 Alvo:</strong> ${decision.target}</div>
        </div>

        <div style="display: flex; gap: 5px; margin-top: 10px;">
          <button class="ai-action-btn" data-action="move" data-token-id="${npcToken.id}" style="flex: 1; background: #4682B4; color: white; border: none; padding: 8px; cursor: pointer; border-radius: 3px;">
            <i class="fas fa-walking"></i> Mover
          </button>
          <button class="ai-action-btn" data-action="attack" data-token-id="${npcToken.id}" style="flex: 1; background: #DC143C; color: white; border: none; padding: 8px; cursor: pointer; border-radius: 3px;">
            <i class="fas fa-fist-raised"></i> Atacar
          </button>
          <button class="ai-action-btn" data-action="execute-all" data-token-id="${npcToken.id}" style="flex: 1; background: #228B22; color: white; border: none; padding: 8px; cursor: pointer; border-radius: 3px;">
            <i class="fas fa-bolt"></i> Executar Tudo
          </button>
        </div>
      </div>
    `;

    const message = await ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ token: npcToken }),
      content: content,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    });

    // Guardar decisão para quando botão for clicado
    game.aiCombat = game.aiCombat || {};
    game.aiCombat[npcToken.id] = {
      decision,
      combatState,
      messageId: message.id,
    };
  }

  /**
   * Executa decisão automaticamente
   */
  async executeDecision(npcToken, decision, combatState) {
    // Implementar nas próximas tarefas
    ui.notifications.info(
      "Execução automática será implementada na próxima fase"
    );
  }

  /**
   * Executa movimento do NPC
   */
  async executeMove(token, decision, combatState) {
    const movement = decision.movement.toLowerCase();

    // Se deve ficar parado
    if (movement.includes("ficar") || movement.includes("não se mover")) {
      ui.notifications.info(`${token.name} permanece na posição atual`);
      return;
    }

    // Se deve aproximar de um alvo
    const approachMatch = movement.match(
      /aproximar.*?(?:de |do |da )?([^\.,]+)/i
    );
    if (approachMatch) {
      const targetName = approachMatch[1].trim();
      const targetToken = combatState.enemies.find((e) =>
        e.name.toLowerCase().includes(targetName.toLowerCase())
      )?.token;

      if (targetToken) {
        // Mover para adjacente ao alvo (1 quadrado de distância)
        const direction = Math.atan2(
          targetToken.y - token.y,
          targetToken.x - token.x
        );

        const newX = targetToken.x - Math.cos(direction) * 100; // 100px = 1 grid
        const newY = targetToken.y - Math.sin(direction) * 100;

        await token.document.update(
          {
            x: newX,
            y: newY,
          },
          { animate: true, animation: { duration: 1000 } }
        );

        ui.notifications.info(
          `${token.name} se aproxima de ${targetToken.name}`
        );
        return;
      }
    }

    // Se são coordenadas específicas
    const coordMatch = movement.match(/\((\d+),\s*(\d+)\)/);
    if (coordMatch) {
      const gridX = parseInt(coordMatch[1]);
      const gridY = parseInt(coordMatch[2]);

      await token.document.update(
        {
          x: gridX * 100,
          y: gridY * 100,
        },
        { animate: true, animation: { duration: 1000 } }
      );

      ui.notifications.info(`${token.name} se move para (${gridX}, ${gridY})`);
      return;
    }

    ui.notifications.warn(
      `Não foi possível interpretar o movimento: ${movement}`
    );
  }

  /**
   * Executa ataque do NPC
   */
  async executeAttack(token, decision, combatState) {
    const actionName = decision.action;
    const targetName = decision.target;

    // Encontrar ação no NPC
    const npc = token.actor;
    const strike = npc.system.actions?.find(
      (a) =>
        a.name.toLowerCase().includes(actionName.toLowerCase()) ||
        a.label?.toLowerCase().includes(actionName.toLowerCase())
    );

    if (!strike) {
      ui.notifications.warn(
        `Ação "${actionName}" não encontrada em ${token.name}`
      );
      console.log(
        "Combat AI | Ações disponíveis:",
        npc.system.actions?.map((a) => a.name || a.label)
      );
      return;
    }

    // Encontrar alvo
    const targetToken = combatState.enemies.find((e) =>
      e.name.toLowerCase().includes(targetName.toLowerCase())
    )?.token;

    if (!targetToken) {
      ui.notifications.warn(`Alvo "${targetName}" não encontrado`);
      return;
    }

    // Executar ataque
    try {
      ui.notifications.info(
        `${token.name} ataca ${targetToken.name} com ${
          strike.name || strike.label
        }!`
      );

      // No PF2e, strikes têm métodos attack() e damage()
      if (strike.attack && typeof strike.attack === "function") {
        await strike.attack({ target: targetToken.actor });
      } else if (strike.variants) {
        // Algumas strikes têm variantes (MAP -0, -5, -10)
        const variant = strike.variants[0];
        if (variant.roll) {
          await variant.roll({ target: targetToken.actor });
        }
      } else {
        ui.notifications.warn("Método de ataque não encontrado para esta ação");
        console.log("Combat AI | Estrutura da strike:", strike);
      }
    } catch (error) {
      console.error("Combat AI | Erro ao executar ataque:", error);
      ui.notifications.error(`Erro ao executar ataque: ${error.message}`);
    }
  }

  /**
   * Executa decisão automaticamente (modo Full Automation)
   */
  async executeDecision(npcToken, decision, combatState) {
    ui.notifications.info(
      `🤖 Automação Total: ${npcToken.name} executa turno...`
    );

    try {
      // Executar movimento
      await this.executeMove(npcToken, decision, combatState);

      // Aguardar animação de movimento
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Executar ataque
      await this.executeAttack(npcToken, decision, combatState);

      ui.notifications.success(
        `✅ Turno de ${npcToken.name} executado automaticamente!`
      );
    } catch (error) {
      console.error("Combat AI | Erro na execução automática:", error);
      ui.notifications.error(`Erro na automação: ${error.message}`);
    }
  }

  /**
   * Define nível de automação
   */
  setAutomationLevel(level) {
    this.automationLevel = level;
    console.log(`Combat AI | Nível de automação: ${level}`);
  }
}

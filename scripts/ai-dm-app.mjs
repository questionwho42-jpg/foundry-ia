import { GeminiAPI } from "./gemini-api.mjs";
import { getGameContext } from "./main.mjs";

/**
 * Aplicação de interface para o AI Dungeon Master
 */
export class AIDungeonMasterApp extends Application {
  constructor(options = {}) {
    super(options);
    this.gemini = null;
    this.conversationHistory = [];
    this.adventureStarted = false;
    this.characterInfo = null;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "ai-dungeon-master",
      title: "Narrador de Aventura Solo IA",
      template: "modules/ai-dungeon-master-pf2e/templates/ai-dm-app.hbs",
      width: 600,
      height: 700,
      resizable: true,
      classes: ["ai-dm-app"],
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: ".content",
          initial: "chat",
        },
      ],
    });
  }

  getData() {
    return {
      conversationHistory: this.conversationHistory,
      hasApiKey: !!game.settings.get("ai-dungeon-master-pf2e", "geminiApiKey"),
      activeScene: canvas.scene?.name || "Nenhuma",
      selectedToken: canvas.tokens?.controlled[0],
      character:
        canvas.tokens?.controlled[0]?.name || "Sem personagem selecionado",
      adventureStarted: this.adventureStarted,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Listener para envio de mensagem
    html.find("#send-message").on("click", () => this._onSendMessage(html));
    html.find("#message-input").on("keypress", (event) => {
      if (event.which === 13 && !event.shiftKey) {
        event.preventDefault();
        this._onSendMessage(html);
      }
    });

    // Listeners para ações rápidas
    html
      .find("#start-adventure")
      .on("click", () => this._onStartAdventure(html));
    html.find("#describe-scene").on("click", () => this._onDescribeScene(html));
    html
      .find("#generate-combat-scene")
      .on("click", () => this._onGenerateCombatScene(html));
    html.find("#generate-npc").on("click", () => this._onGenerateNPC(html));
    html.find("#clear-chat").on("click", () => this._onClearChat(html));

    // Auto-scroll para o final do chat
    this._scrollToBottom(html);
  }

  /**
   * Envia mensagem para a IA
   */
  async _onSendMessage(html) {
    const input = html.find("#message-input");
    const message = input.val().trim();

    if (!message) return;

    const apiKey = game.settings.get("ai-dungeon-master-pf2e", "geminiApiKey");
    if (!apiKey) {
      ui.notifications.error(
        "Configure sua chave API do Google Gemini nas configurações do módulo!"
      );
      return;
    }

    // Limpar input
    input.val("");

    // Adicionar mensagem do usuário ao histórico
    this.conversationHistory.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    this.render();

    try {
      // Inicializar Gemini se necessário
      if (!this.gemini) {
        const model = game.settings.get(
          "ai-dungeon-master-pf2e",
          "geminiModel"
        );
        this.gemini = new GeminiAPI(apiKey, model);
      }

      // Enviar para a IA
      const response = await this.gemini.continueNarrative(message);

      // Adicionar resposta ao histórico
      this.conversationHistory.push({
        role: "assistant",
        content: response,
        timestamp: new Date(),
      });

      this.render();
    } catch (error) {
      console.error("AI DM | Erro ao enviar mensagem:", error);
      ui.notifications.error(`Erro ao comunicar com a IA: ${error.message}`);

      // Remover a mensagem do usuário se houve erro
      this.conversationHistory.pop();
      this.render();
    }
  }

  /**
   * Inicia uma nova aventura solo
   */
  async _onStartAdventure(html) {
    const token = canvas.tokens?.controlled[0];
    if (!token) {
      ui.notifications.warn("Selecione um token de personagem primeiro!");
      return;
    }

    new Dialog({
      title: "Iniciar Aventura Solo",
      content: `
                <form>
                    <div class="form-group">
                        <label>Personagem: <strong>${token.name}</strong></label>
                    </div>
                    <div class="form-group">
                        <label>Tema da Aventura:</label>
                        <select name="theme">
                            <option value="fantasia medieval">Fantasia Medieval</option>
                            <option value="terror gótico">Terror Gótico</option>
                            <option value="investigação urbana">Investigação Urbana</option>
                            <option value="exploração de masmorras">Exploração de Masmorras</option>
                            <option value="mistério e intriga">Mistério e Intriga</option>
                            <option value="alto mar e pirataria">Alto Mar e Pirataria</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Cenário Inicial:</label>
                        <input type="text" name="setting" value="uma taverna movimentada" placeholder="Ex: uma floresta sombria"/>
                    </div>
                </form>
            `,
      buttons: {
        start: {
          icon: '<i class="fas fa-play"></i>',
          label: "Começar Aventura",
          callback: async (html) => {
            const formData = new FormDataExtended(html.find("form")[0]).object;
            await this._beginAdventure(token, formData);
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancelar",
        },
      },
      default: "start",
    }).render(true);
  }

  async _beginAdventure(token, params) {
    const apiKey = game.settings.get("ai-dungeon-master-pf2e", "geminiApiKey");
    if (!apiKey) {
      ui.notifications.error("Configure sua chave API primeiro!");
      return;
    }

    try {
      if (!this.gemini) {
        const model = game.settings.get(
          "ai-dungeon-master-pf2e",
          "geminiModel"
        );
        this.gemini = new GeminiAPI(apiKey, model);
      }

      const adventureParams = {
        characterName: token.name,
        characterClass: token.actor?.class?.name || "Aventureiro",
        characterLevel: token.actor?.level || 1,
        theme: params.theme,
        setting: params.setting,
      };

      const intro = await this.gemini.startSoloAdventure(adventureParams);

      this.adventureStarted = true;
      this.characterInfo = adventureParams;

      this.conversationHistory.push({
        role: "assistant",
        content: `**🎭 AVENTURA INICIADA**\n\n${intro}`,
        timestamp: new Date(),
      });

      this.render();
      ui.notifications.info("Aventura solo iniciada! Boa sorte!");
    } catch (error) {
      console.error("AI DM | Erro ao iniciar aventura:", error);
      ui.notifications.error("Erro ao iniciar aventura");
    }
  }

  /**
   * Gera descrição da cena atual
   */
  async _onDescribeScene(html) {
    if (!canvas.scene) {
      ui.notifications.warn("Nenhuma cena ativa!");
      return;
    }

    const apiKey = game.settings.get("ai-dungeon-master-pf2e", "geminiApiKey");
    if (!apiKey) {
      ui.notifications.error("Configure sua chave API primeiro!");
      return;
    }

    try {
      if (!this.gemini) {
        const model = game.settings.get(
          "ai-dungeon-master-pf2e",
          "geminiModel"
        );
        this.gemini = new GeminiAPI(apiKey, model);
      }

      const sceneData = {
        name: canvas.scene.name,
        width: canvas.scene.width,
        height: canvas.scene.height,
        description: canvas.scene.journal?.content || "",
      };

      const description = await this.gemini.describeScene(sceneData);

      this.conversationHistory.push({
        role: "assistant",
        content: `**Descrição da Cena: ${canvas.scene.name}**\n\n${description}`,
        timestamp: new Date(),
      });

      this.render();
    } catch (error) {
      console.error("AI DM | Erro ao descrever cena:", error);
      ui.notifications.error("Erro ao gerar descrição da cena");
    }
  }

  /**
   * Abre diálogo para gerar cena de combate
   */
  async _onGenerateCombatScene(html) {
    new Dialog({
      title: "Gerar Cena de Combate",
      content: `
                <form>
                    <div class="form-group">
                        <label>Tipo de Local:</label>
                        <select name="locationType">
                            <option value="taverna">Taverna</option>
                            <option value="caverna">Caverna</option>
                            <option value="floresta">Clareira na Floresta</option>
                            <option value="ruinas">Ruínas Antigas</option>
                            <option value="masmorr">Masmorra</option>
                            <option value="cidade">Rua da Cidade</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Nível do Jogador:</label>
                        <input type="number" name="playerLevel" min="1" max="20" value="1"/>
                    </div>
                    <div class="form-group">
                        <label>Número de Inimigos:</label>
                        <input type="number" name="enemyCount" min="1" max="8" value="2"/>
                    </div>
                    <div class="form-group">
                        <label>Dificuldade:</label>
                        <select name="difficulty">
                            <option value="trivial">Trivial</option>
                            <option value="baixo">Baixo</option>
                            <option value="moderado" selected>Moderado</option>
                            <option value="severo">Severo</option>
                            <option value="extremo">Extremo</option>
                        </select>
                    </div>
                </form>
            `,
      buttons: {
        generate: {
          icon: '<i class="fas fa-map"></i>',
          label: "Gerar Cena",
          callback: async (html) => {
            const form = html[0].querySelector("form");
            const formData = new FormData(form);
            const params = {
              locationType: formData.get("locationType"),
              playerLevel: parseInt(formData.get("playerLevel")),
              enemyCount: parseInt(formData.get("enemyCount")),
              difficulty: formData.get("difficulty"),
            };
            await this._generateCombatScene(params);
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancelar",
        },
      },
      default: "generate",
    }).render(true);
  }

  /**
   * Gera cena de combate completa
   */
  async _generateCombatScene(params) {
    const apiKey = game.settings.get("ai-dungeon-master-pf2e", "geminiApiKey");
    if (!apiKey) {
      ui.notifications.error("Configure sua chave API primeiro!");
      return;
    }

    try {
      if (!this.gemini) {
        const model = game.settings.get(
          "ai-dungeon-master-pf2e",
          "geminiModel"
        );
        this.gemini = new GeminiAPI(apiKey, model);
      }

      ui.notifications.info("Gerando cena de combate... Aguarde.");
      const sceneData = await this.gemini.generateCombatScene(params);

      // Criar a cena no Foundry
      const gridSize = 100; // pixels por quadrado
      const sceneWidth = (sceneData.gridSize || 30) * gridSize;
      const sceneHeight = (sceneData.gridSize || 30) * gridSize;

      const scene = await Scene.create({
        name: sceneData.sceneName || "Cena de Combate IA",
        width: sceneWidth,
        height: sceneHeight,
        grid: {
          type: 1, // Grid quadrado
          size: gridSize,
          distance: 5, // 5 pés por quadrado (padrão PF2e)
          units: "pés",
        },
        backgroundColor: "#2b2b2b",
        tokenVision: true,
        fogExploration: true,
        globalLight: false,
      });

      // Criar paredes
      if (sceneData.walls && sceneData.walls.length > 0) {
        await scene.createEmbeddedDocuments(
          "Wall",
          sceneData.walls.map((w) => ({
            c: [w.x1, w.y1, w.x2, w.y2],
            move: 0, // Bloqueia movimento
            sight: 0, // Bloqueia visão
            sound: 0, // Bloqueia som
          }))
        );
      }

      // Criar iluminação
      if (sceneData.lights && sceneData.lights.length > 0) {
        await scene.createEmbeddedDocuments(
          "AmbientLight",
          sceneData.lights.map((l) => ({
            x: l.x,
            y: l.y,
            config: {
              bright: l.bright || 20,
              dim: l.dim || 40,
              color: l.color || "#ff9329",
              animation: {
                type: "torch",
                speed: 5,
                intensity: 5,
              },
            },
          }))
        );
      }

      // Buscar criaturas do compendium e colocar tokens
      if (sceneData.enemies && sceneData.enemies.length > 0) {
        for (const enemy of sceneData.enemies) {
          // Buscar no compendium de bestiário PF2e
          const packs = game.packs.filter(p => p.metadata.type === 'Actor' && p.metadata.name.includes('bestiary'));
          let actor = null;
          
          // Tentar encontrar criatura por nome
          for (const pack of packs) {
            const index = await pack.getIndex();
            const entry = index.find(e => 
              e.name.toLowerCase().includes(enemy.name.toLowerCase()) ||
              enemy.name.toLowerCase().includes(e.name.toLowerCase())
            );
            
            if (entry) {
              actor = await pack.getDocument(entry._id);
              break;
            }
          }
          
          // Se não encontrou no compendium, criar genérico
          if (!actor) {
            console.warn(`AI DM | Criatura "${enemy.name}" não encontrada no compendium, criando genérica`);
            actor = await Actor.create({
              name: enemy.name || "Inimigo",
              type: "npc",
              img: "icons/svg/mystery-man.svg",
              system: {
                details: {
                  level: { value: enemy.level || 1 },
                },
              },
            });
          }

          // Colocar token na cena
          await scene.createEmbeddedDocuments("Token", [
            {
              name: actor.name,
              actorId: actor.id,
              actorLink: false,  // Não linkar (criar cópia única)
              x: enemy.x * gridSize,
              y: enemy.y * gridSize,
              disposition: -1, // Hostil
            },
          ]);
        }
      }

      // Adicionar token do jogador
      const playerToken = canvas.tokens?.controlled[0];
      if (playerToken && playerToken.actor) {
        const playerStartX = sceneData.playerStart.x * gridSize;
        const playerStartY = sceneData.playerStart.y * gridSize;
        
        await scene.createEmbeddedDocuments("Token", [{
          name: playerToken.actor.name,
          actorId: playerToken.actor.id,
          actorLink: true,  // Linkar ao ator original
          x: playerStartX,
          y: playerStartY,
          disposition: 1,  // Amigável
          hidden: false,
          vision: true
        }]);
        
        ui.notifications.info(`Token de ${playerToken.actor.name} adicionado à cena!`);
      } else {
        ui.notifications.warn('Nenhum token selecionado. Selecione seu personagem antes de gerar a cena.');
      }

      // Desenhar objetos decorativos
      if (sceneData.objects && sceneData.objects.length > 0) {
        const drawings = sceneData.objects.map(obj => ({
          x: obj.x * gridSize,
          y: obj.y * gridSize,
          shape: {
            type: 'r',  // Retângulo
            width: obj.width * gridSize,
            height: obj.height * gridSize
          },
          fillColor: '#8B4513',  // Marrom
          fillAlpha: 0.5,
          strokeWidth: 2,
          strokeColor: '#000000',
          strokeAlpha: 1,
          text: obj.name,
          textColor: '#FFFFFF',
          textAlpha: 1,
          fontSize: 24,
          fontFamily: 'Signika'
        }));
        
        await scene.createEmbeddedDocuments("Drawing", drawings);
        ui.notifications.info(`${sceneData.objects.length} objetos adicionados à cena!`);
      }

      // Ativar a cena
      await scene.view();

      ui.notifications.success(
        `Cena "${sceneData.sceneName}" criada com sucesso!`
      );

      this.conversationHistory.push({
        role: "assistant",
        content: `**Cena de Combate Criada**\n\n${
          sceneData.description
        }\n\n*Inimigos: ${
          sceneData.enemies?.length || 0
        }*\n*Abra a cena para ver o layout!*`,
        timestamp: new Date(),
      });

      this.render();
    } catch (error) {
      console.error("AI DM | Erro ao gerar cena:", error);
      ui.notifications.error(`Erro ao gerar cena: ${error.message}`);
    }
  }

  /**
   * Abre diálogo para gerar NPC
   */
  async _onGenerateNPC(html) {
    new Dialog({
      title: "Gerar NPC",
      content: `
                <form>
                    <div class="form-group">
                        <label>Ancestralidade:</label>
                        <input type="text" name="ancestry" value="Aleatória"/>
                    </div>
                    <div class="form-group">
                        <label>Nível:</label>
                        <input type="number" name="level" value="1" min="1" max="25"/>
                    </div>
                    <div class="form-group">
                        <label>Papel/Classe:</label>
                        <input type="text" name="role" value="Genérico"/>
                    </div>
                    <div class="form-group">
                        <label>Alinhamento:</label>
                        <select name="alignment">
                            <option value="LB">Leal e Bom</option>
                            <option value="NB">Neutro e Bom</option>
                            <option value="CB">Caótico e Bom</option>
                            <option value="LN">Leal e Neutro</option>
                            <option value="N" selected>Neutro</option>
                            <option value="CN">Caótico e Neutro</option>
                            <option value="LE">Leal e Mau</option>
                            <option value="NE">Neutro e Mau</option>
                            <option value="CE">Caótico e Mau</option>
                        </select>
                    </div>
                </form>
            `,
      buttons: {
        generate: {
          icon: '<i class="fas fa-magic"></i>',
          label: "Gerar",
          callback: async (html) => {
            const formData = new FormDataExtended(html.find("form")[0]).object;
            await this._generateNPC(formData);
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancelar",
        },
      },
      default: "generate",
    }).render(true);
  }

  async _generateNPC(params) {
    const apiKey = game.settings.get("ai-dungeon-master-pf2e", "geminiApiKey");
    if (!apiKey) {
      ui.notifications.error("Configure sua chave API primeiro!");
      return;
    }

    try {
      if (!this.gemini) {
        const model = game.settings.get(
          "ai-dungeon-master-pf2e",
          "geminiModel"
        );
        this.gemini = new GeminiAPI(apiKey, model);
      }

      ui.notifications.info("Gerando NPC...");
      const npc = await this.gemini.generateNPC(params);

      // Extrair nome do NPC da resposta
      const nameMatch = npc.description.match(/\*\*Nome:\*\*\s*([^\n]+)/i);
      const npcName = nameMatch ? nameMatch[1].trim() : "NPC Gerado pela IA";

      // Usar nível ajustado para desafio solo
      const npcLevel = npc.rawData.adjustedLevel || params.level || 1;

      // Criar ator NPC no Foundry
      const actor = await Actor.create({
        name: npcName,
        type: "npc",
        img: "icons/svg/mystery-man.svg",
        system: {
          details: {
            level: { value: npcLevel },
            publicNotes: npc.description,
          },
        },
      });

      if (actor) {
        ui.notifications.success(
          `NPC "${npcName}" (Nível ${npcLevel}) criado com sucesso!`
        );

        // Abrir ficha do NPC
        actor.sheet.render(true);
      }

      this.conversationHistory.push({
        role: "assistant",
        content: `**NPC Criado: ${npcName}**\n\n${npc.description}`,
        timestamp: new Date(),
      });

      this.render();
    } catch (error) {
      console.error("AI DM | Erro ao gerar NPC:", error);
      ui.notifications.error("Erro ao gerar NPC");
    }
  }

  /**
   * Solicita ajuda com regras
   */
  async _onRuleHelp(html) {
    new Dialog({
      title: "Ajuda com Regras PF2e",
      content: `
                <form>
                    <div class="form-group">
                        <label>Qual regra você quer entender?</label>
                        <textarea name="query" rows="4" placeholder="Ex: Como funcionam as ações de três ações? O que é Stride?"></textarea>
                    </div>
                </form>
            `,
      buttons: {
        ask: {
          icon: '<i class="fas fa-book"></i>',
          label: "Perguntar",
          callback: async (html) => {
            const query = html.find('[name="query"]').val();
            if (query) {
              await this._askRuleHelp(query);
            }
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancelar",
        },
      },
      default: "ask",
    }).render(true);
  }

  async _askRuleHelp(query) {
    const apiKey = game.settings.get("ai-dungeon-master-pf2e", "geminiApiKey");
    if (!apiKey) {
      ui.notifications.error("Configure sua chave API primeiro!");
      return;
    }

    try {
      if (!this.gemini) {
        const model = game.settings.get(
          "ai-dungeon-master-pf2e",
          "geminiModel"
        );
        this.gemini = new GeminiAPI(apiKey, model);
      }

      const help = await this.gemini.getRuleHelp(query);

      this.conversationHistory.push({
        role: "user",
        content: query,
        timestamp: new Date(),
      });

      this.conversationHistory.push({
        role: "assistant",
        content: `**Ajuda com Regras**\n\n${help}`,
        timestamp: new Date(),
      });

      this.render();
    } catch (error) {
      console.error("AI DM | Erro ao obter ajuda:", error);
      ui.notifications.error("Erro ao obter ajuda com regras");
    }
  }

  /**
   * Limpa o histórico de chat
   */
  _onClearChat(html) {
    Dialog.confirm({
      title: "Limpar Conversa",
      content: "<p>Tem certeza que deseja limpar toda a conversa?</p>",
      yes: () => {
        this.conversationHistory = [];
        if (this.gemini) {
          this.gemini.clearHistory();
        }
        this.render();
      },
    });
  }

  /**
   * Faz scroll até o final do chat
   */
  _scrollToBottom(html) {
    const chatContent = html.find(".chat-content");
    if (chatContent.length) {
      chatContent[0].scrollTop = chatContent[0].scrollHeight;
    }
  }

  async _render(force, options) {
    await super._render(force, options);
    this._scrollToBottom(this.element);
  }
}

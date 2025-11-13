console.log("AI Dungeon Master | CARREGANDO A VERSÃO MAIS RECENTE DO main.mjs");
import { AIDungeonMasterApp } from "./ai-dm-app.mjs";
import { GeminiAPI } from "./gemini-api.mjs";
import { CombatAI } from "./combat-ai.mjs";
import { registerSettings } from "./settings.mjs";

/**
 * Inicialização do módulo AI Dungeon Master
 */
Hooks.once("init", function () {
  console.log("AI Dungeon Master | Inicializando módulo");

  // Registrar configurações do módulo
  registerSettings();

  // Adicionar o módulo ao namespace global do jogo
  game.modules.get("ai-dungeon-master-pf2e").api = {
    AIDungeonMasterApp,
    GeminiAPI,
  };
});

/**
 * Hook executado quando o jogo está pronto
 */
Hooks.once("ready", function () {
  console.log("AI Dungeon Master | Módulo carregado e pronto");

  // Verificar se a chave API está configurada
  const apiKey = game.settings.get("ai-dungeon-master-pf2e", "geminiApiKey");
  if (!apiKey) {
    ui.notifications.warn(
      "AI Dungeon Master: Configure sua chave API do Google Gemini nas configurações do módulo.",
    );
  }

  // Adicionar botão ao controle de cenas se o usuário for GM
  if (game.user.isGM) {
    console.log(
      "AI Dungeon Master | GM detectado, funcionalidades completas habilitadas",
    );

    // Inicializar sistema de Combat AI
    const geminiAPI = new GeminiAPI(apiKey);
    const combatAI = new CombatAI(geminiAPI);
    combatAI.initialize();

    // Tornar acessível globalmente
    game.combatAI = combatAI;

    console.log("AI Dungeon Master | Sistema de IA Tática inicializado");
  }
});

/**
 * Adicionar botão de controle da cena para abrir o AI DM
 */
Hooks.on("getSceneControlButtons", (controls) => {
  if (game.user.isGM) {
    let controlsArray = controls;

    // Se 'controls' não for um array, tenta encontrar o array de controles dentro do objeto.
    if (!Array.isArray(controlsArray)) {
      console.warn("AI Dungeon Master | 'controls' não é um array. Tentando encontrar o array de controles aninhado...");
      const potentialArray = Object.values(controls).find(val => Array.isArray(val));
      if (potentialArray) {
        console.log("AI Dungeon Master | Array de controles encontrado em uma propriedade aninhada.");
        controlsArray = potentialArray;
      } else {
        console.error("AI Dungeon Master | Não foi possível encontrar um array de controles válido. O botão não será adicionado.");
        return;
      }
    }

    // Verifica se o botão já existe antes de adicioná-lo
    const existingControl = controlsArray.find(
      (c) => c.name === "ai-dungeon-master",
    );
    if (existingControl) return;

    // Adiciona o novo grupo de controle com o botão da IA
    controlsArray.push({
      name: "ai-dungeon-master",
      title: "AI Dungeon Master",
      icon: "fas fa-brain",
      layer: "aidm-layer",
      tools: [
        {
          name: "ai-dm-open",
          title: "Abrir AI Dungeon Master",
          icon: "fas fa-robot",
          onClick: () => {
            new AIDungeonMasterApp().render(true);
          },
          button: true,
        },
      ],
    });
  }
});

/**
 * Adicionar comando de chat para invocar o AI DM
 */
Hooks.on("chatMessage", (chatLog, message, chatData) => {
  if (message.startsWith("/aidm") || message.startsWith("/dm")) {
    const query = message.replace(/^\/(aidm|dm)\s*/, "");
    if (query) {
      handleAIDMChatCommand(query);
    }
    // Não abre mais a janela do app, apenas processa comandos
    return false; // Previne o envio da mensagem normal
  }
});

/**
 * Processa comandos de chat do AI DM
 * @param {string} query - A pergunta ou comando do usuário
 */
async function handleAIDMChatCommand(query) {
  const apiKey = game.settings.get("ai-dungeon-master-pf2e", "geminiApiKey");
  if (!apiKey) {
    ui.notifications.error(
      "Configure sua chave API do Google Gemini primeiro!",
    );
    return;
  }

  try {
    const gemini = new GeminiAPI(
      apiKey,
      game.settings.get("ai-dungeon-master-pf2e", "geminiModel"),
    );
    const response = await gemini.chat(query, {
      systemContext: getGameContext(),
    });

    // Enviar resposta como mensagem de chat
    ChatMessage.create({
      speaker: {
        alias: "Narrador IA",
      },
      content: `<div class="ai-dm-response">
                <h3><i class="fas fa-book-open"></i> Narrador da Aventura</h3>
                <p>${response}</p>
            </div>`,
      whisper: game.user.isGM ? [] : [game.user.id],
    });

    // Salvar resposta narrativa no Diário de memória da IA
    await registrarMemoriaIA("narrativa", "Memória da IA", response);
  } catch (error) {
    console.error("AI Dungeon Master | Erro ao processar comando:", error);
    ui.notifications.error(
      "Erro ao comunicar com a IA. Verifique sua chave API e conexão.",
    );
  }
}

/**
 * Obtém o contexto atual do jogo para fornecer à IA
 * @returns {string} Contexto formatado do jogo
 */
function getGameContext() {
  const context = {
    system: "Pathfinder 2e",
    scene: canvas.scene?.name || "Nenhuma cena ativa",
    character: canvas.tokens?.controlled[0]?.name || "Aventureiro",
    characterClass:
      canvas.tokens?.controlled[0]?.actor?.class?.name || "Desconhecida",
    characterLevel: canvas.tokens?.controlled[0]?.actor?.level || 1,
  };

  return `CONTEXTO DA AVENTURA SOLO:

Sistema: ${context.system}
Localização atual: ${context.scene}
Personagem: ${context.character}
Classe: ${context.characterClass}
Nível: ${context.characterLevel}

PAPEL DO NARRADOR:
Você é o Mestre desta aventura solo. Você narra a história, interpreta todos os NPCs, descreve o mundo e apresenta desafios. Mantenha a narrativa envolvente e ofereça escolhas significativas ao jogador único.

ESTILO DE NARRAÇÃO:
- Use segunda pessoa ("você vê", "você sente")
- Seja descritivo e imersivo
- Crie tensão e mistério
- Dê personalidade aos NPCs
- Sempre termine oferecendo escolhas ou uma pergunta

Responda de forma concisa mas impactante.`;
}

/**
 * Cria ou atualiza um Diário (Journal Entry) para servir como memória persistente da IA
 * @param {string} tipo - Tipo de memória (ex: "narrativa", "tática")
 * @param {string} nome - Nome do registro (ex: "Memória da IA")
 * @param {string} conteudo - Texto a ser salvo
 * @returns {Promise<JournalEntry>} O Diário criado ou atualizado
 */
export async function registrarMemoriaIA(
  tipo = "narrativa",
  nome = "Memória da IA",
  conteudo = "",
) {
  if (!game.user.isGM) {
    ui.notifications.warn("Apenas o GM pode registrar memória da IA.");
    return null;
  }

  // Buscar se já existe um Diário com esse nome
  let journal = game.journal.getName(nome);
  if (journal) {
    // Atualizar conteúdo existente
    await journal.update({
      content: conteudo,
      flags: { "ai-dungeon-master-pf2e": { tipo } },
    });
    console.log(`AI Dungeon Master | Memória IA atualizada: ${nome}`);
    return journal;
  } else {
    // Criar novo Diário
    journal = await JournalEntry.create({
      name: nome,
      content: conteudo,
      flags: { "ai-dungeon-master-pf2e": { tipo } },
      folder: null,
      permission: { default: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER },
    });
    console.log(`AI Dungeon Master | Memória IA criada: ${nome}`);
    return journal;
  }
}

export { handleAIDMChatCommand, getGameContext };

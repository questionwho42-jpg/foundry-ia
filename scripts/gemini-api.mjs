/**
 * Cliente para a API do Google Gemini
 */
export class GeminiAPI {
  constructor(apiKey, model = "gemini-2.5-pro") {
    this.apiKey = apiKey;
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    this.model = model;
    this.conversationHistory = [];

    // Rate limiting
    this.lastRequestTime = 0;
    this.requestCount = 0;
    this.rateLimits = {
      "gemini-2.5-pro": { rpm: 2, delay: 30000 }, // 2 req/min = 30s entre requisiÃ§Ãµes
      "gemini-2.5-flash": { rpm: 10, delay: 6000 }, // 10 req/min = 6s entre requisiÃ§Ãµes
      "gemini-2.5-flash-8b": { rpm: 15, delay: 4000 }, // 15 req/min = 4s entre requisiÃ§Ãµes
    };
  }

  /**
   * Verifica e aplica rate limiting
   */
  async checkRateLimit() {
    const limit =
      this.rateLimits[this.model] || this.rateLimits["gemini-2.5-pro"];
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < limit.delay) {
      const waitTime = limit.delay - timeSinceLastRequest;
      const waitSeconds = Math.ceil(waitTime / 1000);

      ui.notifications.warn(
        `Aguarde ${waitSeconds}s para evitar exceder o limite da API (${limit.rpm} requisiÃ§Ãµes/min)`,
        { permanent: false }
      );

      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Envia uma mensagem para o Gemini e obtÃ©m resposta
   * @param {string} message - Mensagem do usuÃ¡rio
   * @param {Object} options - OpÃ§Ãµes adicionais
   * @returns {Promise<string>} Resposta da IA
   */
  async chat(message, options = {}) {
    // Aplicar rate limiting
    await this.checkRateLimit();

    const {
      systemContext = "",
      temperature = 0.7,
      maxTokens = 2048,
      resetHistory = false,
    } = options;

    if (resetHistory) {
      this.conversationHistory = [];
    }

    // Adicionar contexto do sistema se fornecido
    if (systemContext && this.conversationHistory.length === 0) {
      this.conversationHistory.push({
        role: "user",
        parts: [{ text: systemContext }],
      });
      this.conversationHistory.push({
        role: "model",
        parts: [
          { text: "Entendido. Estou pronto para ajudar como Dungeon Master!" },
        ],
      });
    }

    // Adicionar mensagem do usuÃ¡rio
    this.conversationHistory.push({
      role: "user",
      parts: [{ text: message }],
    });

    try {
      const response = await this.generateContent({
        contents: this.conversationHistory,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          topK: 40,
          topP: 0.95,
        },
      });

      const responseText = this.extractTextFromResponse(response);

      // Adicionar resposta ao histÃ³rico
      this.conversationHistory.push({
        role: "model",
        parts: [{ text: responseText }],
      });

      return responseText;
    } catch (error) {
      console.error("GeminiAPI | Erro ao gerar conteÃºdo:", error);
      throw new Error(`Falha na comunicaÃ§Ã£o com Gemini: ${error.message}`);
    }
  }

  /**
   * Inicia uma aventura solo narrativa
   * @param {Object} adventureParams - ParÃ¢metros da aventura
   * @returns {Promise<string>} IntroduÃ§Ã£o narrativa
   */
  async startSoloAdventure(adventureParams) {
    const {
      characterName = "aventureiro",
      characterClass = "desconhecida",
      characterLevel = 1,
      theme = "fantasia medieval",
      setting = "uma taverna",
    } = adventureParams;

    const prompt = `VocÃª Ã© um Mestre de Aventuras Solo expert em Pathfinder 2e. Sua funÃ§Ã£o Ã© narrar uma histÃ³ria interativa e envolvente para UM Ãºnico jogador.

PERSONAGEM DO JOGADOR:
- Nome: ${characterName}
- Classe: ${characterClass}
- NÃ­vel: ${characterLevel}

CONFIGURAÃ‡ÃƒO DA AVENTURA:
- Tema: ${theme}
- CenÃ¡rio inicial: ${setting}

INSTRUÃ‡Ã•ES IMPORTANTES:
1. Narre em segunda pessoa ("vocÃª vÃª", "vocÃª sente")
2. Seja descritivo e imersivo - use todos os sentidos
3. Apresente escolhas significativas ao jogador
4. Gerencie NPCs com personalidades distintas
5. Crie tensÃ£o e mistÃ©rio gradualmente
6. Mantenha o ritmo apropriado para aventuras solo
7. Use as regras do Pathfinder 2e quando necessÃ¡rio
8. Sempre termine com opÃ§Ãµes ou uma pergunta para o jogador

Inicie a aventura com uma cena envolvente que capture a atenÃ§Ã£o do jogador imediatamente. EstabeleÃ§a o ambiente, apresente um gancho narrativo e ofereÃ§a as primeiras escolhas.`;

    return await this.chat(prompt, { resetHistory: true, temperature: 0.9 });
  }

  /**
   * Continua a narrativa baseado na aÃ§Ã£o do jogador
   * @param {string} playerAction - AÃ§Ã£o descrita pelo jogador
   * @returns {Promise<string>} ContinuaÃ§Ã£o da narrativa
   */
  async continueNarrative(playerAction) {
    const prompt = `AÃ§Ã£o do jogador: ${playerAction}

Como Mestre da Aventura, responda Ã  aÃ§Ã£o do jogador:
1. Descreva vividamente o resultado da aÃ§Ã£o
2. Introduza novos elementos narrativos se apropriado
3. Mantenha a tensÃ£o e o interesse
4. Apresente novas escolhas ou desafios
5. Use mecÃ¢nicas do PF2e quando necessÃ¡rio (testes, combate, etc)

Responda de forma imersiva e termine oferecendo novas possibilidades ao jogador.`;

    return await this.chat(prompt);
  }

  /**
   * Gera descriÃ§Ã£o narrativa de uma cena para aventura solo
   * @param {Object} sceneData - Dados da cena
   * @returns {Promise<string>} DescriÃ§Ã£o gerada
   */
  async describeScene(sceneData) {
    const prompt = `Como Mestre da Aventura Solo, descreva de forma envolvente e imersiva a seguinte cena para o jogador:

Nome da Cena: ${sceneData.name}
${sceneData.description ? `Contexto: ${sceneData.description}` : ""}

INSTRUÃ‡Ã•ES:
- Narre em segunda pessoa ("VocÃª se encontra...", "Ao seu redor...")
- Use descriÃ§Ãµes sensoriais ricas (visÃ£o, som, cheiro, tato)
- Crie atmosfera apropriada ao local
- Sugira possibilidades de exploraÃ§Ã£o
- Inclua detalhes que despertem curiosidade
- Termine com uma pergunta ou escolha para o jogador

FaÃ§a o jogador SENTIR que estÃ¡ realmente lÃ¡.`;

    return await this.chat(prompt, { resetHistory: true, temperature: 0.8 });
  }

  /**
   * Gera um NPC simples para aventura solo
   * @param {Object} npcParams - ParÃ¢metros do NPC
   * @returns {Promise<Object>} Dados do NPC gerado
   */
  async generateNPC(npcParams) {
    const {
      ancestry = "aleatÃ³ria",
      level = 1,
      role = "genÃ©rico",
      alignment = "neutro",
      personality = "aleatÃ³ria",
    } = npcParams;

    // Ajustar nÃ­vel de desafio para jogador solo (nÃ­veis baixos: -1, mÃ©dios: -2, altos: -3)
    const adjustedLevel = Math.max(level - 1, -1);

    // Prompt simplificado incluindo equipamentos
    const prompt = `Crie um NPC para aventura SOLO em Pathfinder 2e:

Ancestralidade: ${ancestry}
NÃ­vel do Jogador: ${level}
NÃ­vel do NPC: ${adjustedLevel} (ajustado para desafio solo)
Papel: ${role}

ForneÃ§a APENAS:
- Nome
- AparÃªncia (2 frases)
- Personalidade (2 frases)
- Equipamento: liste 2-4 itens apropriados para nÃ­vel ${adjustedLevel} (armas, armadura, itens Ãºteis)
- O que oferece ao jogador (1 frase)

Seja DIRETO. Sem lore extenso.`;

    const response = await this.chat(prompt, {
      resetHistory: true,
      temperature: 0.7,
    });

    return {
      description: response,
      rawData: { ...npcParams, adjustedLevel },
    };
  }

  /**
   * Fornece ajuda com regras do PF2e
   * @param {string} ruleQuery - Pergunta sobre regra
   * @returns {Promise<string>} ExplicaÃ§Ã£o da regra
   */
  async getRuleHelp(ruleQuery) {
    const prompt = `Como especialista em regras do Pathfinder 2e, explique de forma clara e concisa:

${ruleQuery}

Cite a regra oficial quando possÃ­vel e forneÃ§a exemplos prÃ¡ticos.`;

    return await this.chat(prompt, { resetHistory: true });
  }

  /**
   * Gera dados estruturados para cena de combate
   * @param {Object} sceneParams - ParÃ¢metros da cena
   * @returns {Promise<Object>} Dados da cena estruturados
   */
  async generateCombatScene(sceneParams) {
    const {
      locationType = "taverna",
      playerLevel = 1,
      enemyCount = 2,
      difficulty = "moderado",
    } = sceneParams;

    // Simplificado: usar estrutura fixa e sÃ³ pedir nomes/descriÃ§Ã£o
    const prompt = `Cena de combate para Pathfinder 2e:
Local: ${locationType}
Inimigos: ${enemyCount}

ForneÃ§a APENAS:
1. Nome da cena (curto)
2. DescriÃ§Ã£o (1 frase)
3. Nome de ${enemyCount} inimigos apropriados para ${locationType}
4. Objetos (2-4 itens: mesa, caixa, barril, pedra, altar, etc)

Exemplo:
Nome: Taverna Sombria
DescriÃ§Ã£o: MobÃ­lia quebrada e cheiro de cerveja.
Inimigos: Bandido, Capanga
Objetos: Mesa grande, Barril, Cadeiras quebradas`;

    const response = await this.chat(prompt, {
      resetHistory: true,
      temperature: 0.6,
    });

    // Extrair informaÃ§Ãµes da resposta
    const nameMatch = response.match(/Nome:\s*(.+)/i);
    const descMatch = response.match(/DescriÃ§Ã£o:\s*(.+)/i);
    const enemiesMatch = response.match(/Inimigos?:\s*(.+)/i);
    const objectsMatch = response.match(/Objetos?:\s*(.+)/i);
    const doorsMatch = response.match(/Portas?:\s*(.+)/i);
    const windowsMatch = response.match(/Janelas?:\s*(.+)/i);

    const sceneName = nameMatch
      ? nameMatch[1].trim()
      : `${locationType} de Combate`;
    const description = descMatch
      ? descMatch[1].trim()
      : `Uma ${locationType} pronta para combate.`;
    const enemyNames = enemiesMatch
      ? enemiesMatch[1]
          .split(",")
          .map((e) => e.trim())
          .slice(0, enemyCount)
      : Array(enemyCount).fill("Inimigo");
    const objectNames = objectsMatch
      ? objectsMatch[1]
          .split(",")
          .map((o) => o.trim())
          .slice(0, 4)
      : ["Mesa", "Caixa"];
    
    // Extrair portas e janelas
    const doorsList = doorsMatch
      ? doorsMatch[1]
          .split(",")
          .map((d) => d.trim().toLowerCase())
          .filter((d) => ["norte", "sul", "leste", "oeste"].includes(d))
      : ["sul"];  // Padr?o: porta ao sul
    
    const windowsList = windowsMatch
      ? windowsMatch[1]
          .split(",")
          .map((w) => w.trim().toLowerCase())
          .filter((w) => ["norte", "sul", "leste", "oeste"].includes(w))
      : [];  // Padr?o: sem janelas

    // Gerar estrutura baseada no tipo de local
    const gridSize = 30;
    const enemyLevel = Math.max(playerLevel - 1, -1);

    // Layout simples: sala retangular
    const roomWidth = 20;
    const roomHeight = 15;
    const pixelWidth = roomWidth * 100;
    const pixelHeight = roomHeight * 100;

    // Paredes formando retÃ¢ngulo
    const walls = [
      { x1: 0, y1: 0, x2: pixelWidth, y2: 0 }, // Norte
      { x1: pixelWidth, y1: 0, x2: pixelWidth, y2: pixelHeight }, // Leste
      { x1: 0, y1: pixelHeight, x2: pixelWidth, y2: pixelHeight }, // Sul
      { x1: 0, y1: 0, x2: 0, y2: pixelHeight }, // Oeste
    ];

    // Luzes nos cantos
    const lights = [
      { x: 300, y: 300, bright: 20, dim: 40, color: "#ff9329" },
      { x: pixelWidth - 300, y: 300, bright: 20, dim: 40, color: "#ff9329" },
      { x: 300, y: pixelHeight - 300, bright: 20, dim: 40, color: "#ff9329" },
      {
        x: pixelWidth - 300,
        y: pixelHeight - 300,
        bright: 20,
        dim: 40,
        color: "#ff9329",
      },
    ];

    // Distribuir inimigos pela sala
    const enemies = enemyNames.map((name, i) => {
      const angle = (i / enemyCount) * Math.PI * 2;
      const radius = 5;
      const centerX = roomWidth / 2;
      const centerY = roomHeight / 2;

      return {
        name: name,
        level: enemyLevel,
        x: Math.floor(centerX + Math.cos(angle) * radius),
        y: Math.floor(centerY + Math.sin(angle) * radius),
      };
    });

    // Gerar objetos decorativos espalhados pela sala
    const objects = objectNames.map((name) => {
      const x = Math.floor(2 + Math.random() * (roomWidth - 4));
      const y = Math.floor(2 + Math.random() * (roomHeight - 4));
      const width = 2; // 2 quadrados
      const height = 1; // 1 quadrado

      return {
        name: name,
        x: x,
        y: y,
        width: width,
        height: height,
      };
    });

    // Gerar informa??es de portas para o Foundry
    const doors = [];
    const doorPositions = {
      norte: { x: centerH, y: 0 },
      sul: { x: centerH, y: pixelHeight },
      leste: { x: pixelWidth, y: centerV },
      oeste: { x: 0, y: centerV }
    };
    
    doorsList.forEach(dir => {
      doors.push({
        direction: dir,
        x: doorPositions[dir].x,
        y: doorPositions[dir].y
      });
    });
    
    const windows = [];
    windowsList.forEach(dir => {
      windows.push({
        direction: dir,
        x: doorPositions[dir].x,
        y: doorPositions[dir].y
      });
    });

    return {
      sceneName,
      description,
      gridSize,
      walls,
      lights,
      playerStart: { x: roomWidth / 2, y: roomHeight - 2 },
      enemies,
      objects,
      doors,
      windows
    };
  }

  /**
   * Faz chamada Ã  API do Gemini
   * @param {Object} requestBody - Corpo da requisiÃ§Ã£o
   * @returns {Promise<Object>} Resposta da API
   */
  async generateContent(requestBody) {
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  }

  /**
   * Extrai texto da resposta do Gemini
   * @param {Object} response - Resposta da API
   * @returns {string} Texto extraÃ­do
   */
  extractTextFromResponse(response) {
    // Log para debug
    console.log(
      "GeminiAPI | Resposta recebida:",
      JSON.stringify(response, null, 2)
    );

    if (!response.candidates || response.candidates.length === 0) {
      console.error("GeminiAPI | Sem candidates na resposta");
      throw new Error("Nenhuma resposta gerada pela IA");
    }

    const candidate = response.candidates[0];

    // Verificar se hÃ¡ bloqueio de seguranÃ§a
    if (candidate.finishReason === "SAFETY") {
      throw new Error(
        "Resposta bloqueada por filtros de seguranÃ§a. Tente reformular sua pergunta."
      );
    }

    // IMPORTANTE: Gemini 2.5 Pro pode usar thinking tokens
    // Se MAX_TOKENS foi atingido apenas no raciocÃ­nio, parts pode estar vazio
    if (candidate.finishReason === "MAX_TOKENS") {
      const thoughtsCount = response.usageMetadata?.thoughtsTokenCount || 0;
      const totalCount = response.usageMetadata?.totalTokenCount || 0;
      console.warn("GeminiAPI | Limite de tokens atingido:", {
        thoughtsTokens: thoughtsCount,
        totalTokens: totalCount,
        hasContent: !!candidate.content,
      });

      // Se o modelo usou todos os tokens para raciocÃ­nio e nÃ£o gerou resposta
      if (
        thoughtsCount > 0 &&
        (!candidate.content?.parts || candidate.content.parts.length === 0)
      ) {
        throw new Error(
          `Limite de tokens atingido durante o raciocÃ­nio (${thoughtsCount} tokens). Aumente o valor de "Comprimento MÃ¡ximo da Narrativa" nas configuraÃ§Ãµes para pelo menos ${
            Math.ceil((totalCount + 2000) / 512) * 512
          }.`
        );
      }
    }

    // Verificar estrutura da resposta
    if (!candidate.content) {
      console.error("GeminiAPI | Sem content no candidate:", candidate);
      throw new Error("Resposta da IA em formato invÃ¡lido (sem content)");
    }

    if (!candidate.content.parts || candidate.content.parts.length === 0) {
      console.error("GeminiAPI | Sem parts no content:", candidate.content);
      throw new Error("Resposta da IA em formato invÃ¡lido (sem parts)");
    }

    const text = candidate.content.parts
      .map((part) => part.text || "")
      .join("")
      .trim();

    if (!text) {
      console.error("GeminiAPI | Texto vazio extraÃ­do");
      throw new Error("Resposta vazia da IA");
    }

    return text;
  }

  /**
   * Limpa o histÃ³rico de conversaÃ§Ã£o
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * ObtÃ©m o histÃ³rico de conversaÃ§Ã£o
   * @returns {Array} HistÃ³rico
   */
  getHistory() {
    return [...this.conversationHistory];
  }
}


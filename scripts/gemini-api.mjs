/**
 * Cliente para a API do Google Gemini
 */
export class GeminiAPI {
    constructor(apiKey, model = 'gemini-2.5-pro') {
        this.apiKey = apiKey;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
        this.model = model;
        this.conversationHistory = [];
        
        // Rate limiting
        this.lastRequestTime = 0;
        this.requestCount = 0;
        this.rateLimits = {
            'gemini-2.5-pro': { rpm: 2, delay: 30000 }, // 2 req/min = 30s entre requisições
            'gemini-2.5-flash': { rpm: 10, delay: 6000 }, // 10 req/min = 6s entre requisições
            'gemini-2.5-flash-8b': { rpm: 15, delay: 4000 } // 15 req/min = 4s entre requisições
        };
    }
    
    /**
     * Verifica e aplica rate limiting
     */
    async checkRateLimit() {
        const limit = this.rateLimits[this.model] || this.rateLimits['gemini-2.5-pro'];
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < limit.delay) {
            const waitTime = limit.delay - timeSinceLastRequest;
            const waitSeconds = Math.ceil(waitTime / 1000);
            
            ui.notifications.warn(
                `Aguarde ${waitSeconds}s para evitar exceder o limite da API (${limit.rpm} requisições/min)`,
                { permanent: false }
            );
            
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastRequestTime = Date.now();
    }
    
    /**
     * Envia uma mensagem para o Gemini e obtém resposta
     * @param {string} message - Mensagem do usuário
     * @param {Object} options - Opções adicionais
     * @returns {Promise<string>} Resposta da IA
     */
    async chat(message, options = {}) {
        // Aplicar rate limiting
        await this.checkRateLimit();
        
        const {
            systemContext = '',
            temperature = 0.7,
            maxTokens = 2048,
            resetHistory = false
        } = options;
        
        if (resetHistory) {
            this.conversationHistory = [];
        }
        
        // Adicionar contexto do sistema se fornecido
        if (systemContext && this.conversationHistory.length === 0) {
            this.conversationHistory.push({
                role: 'user',
                parts: [{ text: systemContext }]
            });
            this.conversationHistory.push({
                role: 'model',
                parts: [{ text: 'Entendido. Estou pronto para ajudar como Dungeon Master!' }]
            });
        }
        
        // Adicionar mensagem do usuário
        this.conversationHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });
        
        try {
            const response = await this.generateContent({
                contents: this.conversationHistory,
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens,
                    topK: 40,
                    topP: 0.95
                }
            });
            
            const responseText = this.extractTextFromResponse(response);
            
            // Adicionar resposta ao histórico
            this.conversationHistory.push({
                role: 'model',
                parts: [{ text: responseText }]
            });
            
            return responseText;
        } catch (error) {
            console.error('GeminiAPI | Erro ao gerar conteúdo:', error);
            throw new Error(`Falha na comunicação com Gemini: ${error.message}`);
        }
    }
    
    /**
     * Inicia uma aventura solo narrativa
     * @param {Object} adventureParams - Parâmetros da aventura
     * @returns {Promise<string>} Introdução narrativa
     */
    async startSoloAdventure(adventureParams) {
        const {
            characterName = 'aventureiro',
            characterClass = 'desconhecida',
            characterLevel = 1,
            theme = 'fantasia medieval',
            setting = 'uma taverna'
        } = adventureParams;
        
        const prompt = `Você é um Mestre de Aventuras Solo expert em Pathfinder 2e. Sua função é narrar uma história interativa e envolvente para UM único jogador.

PERSONAGEM DO JOGADOR:
- Nome: ${characterName}
- Classe: ${characterClass}
- Nível: ${characterLevel}

CONFIGURAÇÃO DA AVENTURA:
- Tema: ${theme}
- Cenário inicial: ${setting}

INSTRUÇÕES IMPORTANTES:
1. Narre em segunda pessoa ("você vê", "você sente")
2. Seja descritivo e imersivo - use todos os sentidos
3. Apresente escolhas significativas ao jogador
4. Gerencie NPCs com personalidades distintas
5. Crie tensão e mistério gradualmente
6. Mantenha o ritmo apropriado para aventuras solo
7. Use as regras do Pathfinder 2e quando necessário
8. Sempre termine com opções ou uma pergunta para o jogador

Inicie a aventura com uma cena envolvente que capture a atenção do jogador imediatamente. Estabeleça o ambiente, apresente um gancho narrativo e ofereça as primeiras escolhas.`;
        
        return await this.chat(prompt, { resetHistory: true, temperature: 0.9 });
    }
    
    /**
     * Continua a narrativa baseado na ação do jogador
     * @param {string} playerAction - Ação descrita pelo jogador
     * @returns {Promise<string>} Continuação da narrativa
     */
    async continueNarrative(playerAction) {
        const prompt = `Ação do jogador: ${playerAction}

Como Mestre da Aventura, responda à ação do jogador:
1. Descreva vividamente o resultado da ação
2. Introduza novos elementos narrativos se apropriado
3. Mantenha a tensão e o interesse
4. Apresente novas escolhas ou desafios
5. Use mecânicas do PF2e quando necessário (testes, combate, etc)

Responda de forma imersiva e termine oferecendo novas possibilidades ao jogador.`;
        
        return await this.chat(prompt);
    }
    
    /**
     * Gera descrição narrativa de uma cena para aventura solo
     * @param {Object} sceneData - Dados da cena
     * @returns {Promise<string>} Descrição gerada
     */
    async describeScene(sceneData) {
        const prompt = `Como Mestre da Aventura Solo, descreva de forma envolvente e imersiva a seguinte cena para o jogador:

Nome da Cena: ${sceneData.name}
${sceneData.description ? `Contexto: ${sceneData.description}` : ''}

INSTRUÇÕES:
- Narre em segunda pessoa ("Você se encontra...", "Ao seu redor...")
- Use descrições sensoriais ricas (visão, som, cheiro, tato)
- Crie atmosfera apropriada ao local
- Sugira possibilidades de exploração
- Inclua detalhes que despertem curiosidade
- Termine com uma pergunta ou escolha para o jogador

Faça o jogador SENTIR que está realmente lá.`;
        
        return await this.chat(prompt, { resetHistory: true, temperature: 0.8 });
    }
    
    /**
     * Gera um NPC para aventura solo com personalidade rica
     * @param {Object} npcParams - Parâmetros do NPC
     * @returns {Promise<Object>} Dados do NPC gerado
     */
    async generateNPC(npcParams) {
        const {
            ancestry = 'aleatória',
            level = 1,
            role = 'genérico',
            alignment = 'neutro',
            personality = 'aleatória'
        } = npcParams;
        
        const prompt = `Como Mestre da Aventura Solo, crie um NPC MEMORÁVEL e TRIDIMENSIONAL para Pathfinder 2e:

PARÂMETROS:
- Ancestralidade: ${ancestry}
- Nível: ${level}
- Papel: ${role}
- Alinhamento: ${alignment}
- Personalidade: ${personality}

INCLUA OBRIGATORIAMENTE:
1. **Nome** completo e apropriado
2. **Aparência detalhada** (como o jogador vê este NPC)
3. **Personalidade única** (maneirismos, modo de falar, quirks)
4. **Motivação secreta** (o que realmente querem)
5. **Background envolvente** (história pessoal interessante)
6. **Ganchos narrativos** (3 formas de envolver este NPC na história)
7. **Informações úteis** (o que sabem que pode ajudar o jogador)
8. **Características mecânicas PF2e** relevantes

Este NPC deve ser INESQUECÍVEL. Dê vida a eles!`;
        
        const response = await this.chat(prompt, { resetHistory: true, temperature: 0.9 });
        
        return {
            description: response,
            rawData: npcParams
        };
    }
    
    /**
     * Fornece ajuda com regras do PF2e
     * @param {string} ruleQuery - Pergunta sobre regra
     * @returns {Promise<string>} Explicação da regra
     */
    async getRuleHelp(ruleQuery) {
        const prompt = `Como especialista em regras do Pathfinder 2e, explique de forma clara e concisa:

${ruleQuery}

Cite a regra oficial quando possível e forneça exemplos práticos.`;
        
        return await this.chat(prompt, { resetHistory: true });
    }
    
    /**
     * Faz chamada à API do Gemini
     * @param {Object} requestBody - Corpo da requisição
     * @returns {Promise<Object>} Resposta da API
     */
    async generateContent(requestBody) {
        const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    }
    
    /**
     * Extrai texto da resposta do Gemini
     * @param {Object} response - Resposta da API
     * @returns {string} Texto extraído
     */
    extractTextFromResponse(response) {
        // Log para debug
        console.log('GeminiAPI | Resposta recebida:', JSON.stringify(response, null, 2));
        
        if (!response.candidates || response.candidates.length === 0) {
            console.error('GeminiAPI | Sem candidates na resposta');
            throw new Error('Nenhuma resposta gerada pela IA');
        }
        
        const candidate = response.candidates[0];
        
        // Verificar se há bloqueio de segurança
        if (candidate.finishReason === 'SAFETY') {
            throw new Error('Resposta bloqueada por filtros de segurança. Tente reformular sua pergunta.');
        }
        
        // Verificar estrutura da resposta
        if (!candidate.content) {
            console.error('GeminiAPI | Sem content no candidate:', candidate);
            throw new Error('Resposta da IA em formato inválido (sem content)');
        }
        
        if (!candidate.content.parts || candidate.content.parts.length === 0) {
            console.error('GeminiAPI | Sem parts no content:', candidate.content);
            throw new Error('Resposta da IA em formato inválido (sem parts)');
        }
        
        const text = candidate.content.parts
            .map(part => part.text || '')
            .join('')
            .trim();
            
        if (!text) {
            console.error('GeminiAPI | Texto vazio extraído');
            throw new Error('Resposta vazia da IA');
        }
        
        return text;
    }
    
    /**
     * Limpa o histórico de conversação
     */
    clearHistory() {
        this.conversationHistory = [];
    }
    
    /**
     * Obtém o histórico de conversação
     * @returns {Array} Histórico
     */
    getHistory() {
        return [...this.conversationHistory];
    }
}

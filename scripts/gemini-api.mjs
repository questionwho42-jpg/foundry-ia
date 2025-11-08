/**
 * Cliente para a API do Google Gemini
 */
export class GeminiAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
        this.model = 'gemini-1.5-flash'; // Modelo padrão
        this.conversationHistory = [];
    }
    
    /**
     * Envia uma mensagem para o Gemini e obtém resposta
     * @param {string} message - Mensagem do usuário
     * @param {Object} options - Opções adicionais
     * @returns {Promise<string>} Resposta da IA
     */
    async chat(message, options = {}) {
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
     * Gera descrição narrativa de uma cena
     * @param {Object} sceneData - Dados da cena
     * @returns {Promise<string>} Descrição gerada
     */
    async describeScene(sceneData) {
        const prompt = `Como Dungeon Master, crie uma descrição narrativa e imersiva para a seguinte cena:

Nome: ${sceneData.name}
Dimensões: ${sceneData.width}x${sceneData.height}
${sceneData.description ? `Descrição básica: ${sceneData.description}` : ''}

Forneça uma descrição rica em detalhes sensoriais (visão, som, cheiro) que engaje os jogadores.`;
        
        return await this.chat(prompt, { resetHistory: true });
    }
    
    /**
     * Gera um NPC baseado em parâmetros
     * @param {Object} npcParams - Parâmetros do NPC
     * @returns {Promise<Object>} Dados do NPC gerado
     */
    async generateNPC(npcParams) {
        const {
            ancestry = 'aleatória',
            level = 1,
            role = 'genérico',
            alignment = 'neutro'
        } = npcParams;
        
        const prompt = `Como especialista em Pathfinder 2e, gere um NPC completo com:

Ancestralidade: ${ancestry}
Nível: ${level}
Papel: ${role}
Alinhamento: ${alignment}

Inclua:
1. Nome apropriado
2. Descrição física
3. Personalidade e motivação
4. Background breve
5. Sugestões de perícias e características mecânicas relevantes para PF2e

Formate de forma clara e organizada.`;
        
        const response = await this.chat(prompt, { resetHistory: true });
        
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
        if (!response.candidates || response.candidates.length === 0) {
            throw new Error('Nenhuma resposta gerada pela IA');
        }
        
        const candidate = response.candidates[0];
        if (!candidate.content || !candidate.content.parts) {
            throw new Error('Resposta da IA em formato inválido');
        }
        
        return candidate.content.parts
            .map(part => part.text)
            .join('')
            .trim();
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

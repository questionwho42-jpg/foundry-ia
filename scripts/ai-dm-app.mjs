import { GeminiAPI } from './gemini-api.mjs';
import { getGameContext } from './main.mjs';

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
            id: 'ai-dungeon-master',
            title: 'Narrador de Aventura Solo IA',
            template: 'modules/ai-dungeon-master-pf2e/templates/ai-dm-app.hbs',
            width: 600,
            height: 700,
            resizable: true,
            classes: ['ai-dm-app'],
            tabs: [
                {
                    navSelector: '.tabs',
                    contentSelector: '.content',
                    initial: 'chat'
                }
            ]
        });
    }
    
    getData() {
        return {
            conversationHistory: this.conversationHistory,
            hasApiKey: !!game.settings.get('ai-dungeon-master-pf2e', 'geminiApiKey'),
            activeScene: canvas.scene?.name || 'Nenhuma',
            selectedToken: canvas.tokens?.controlled[0],
            character: canvas.tokens?.controlled[0]?.name || 'Sem personagem selecionado',
            adventureStarted: this.adventureStarted
        };
    }
    
    activateListeners(html) {
        super.activateListeners(html);
        
        // Listener para envio de mensagem
        html.find('#send-message').on('click', () => this._onSendMessage(html));
        html.find('#message-input').on('keypress', (event) => {
            if (event.which === 13 && !event.shiftKey) {
                event.preventDefault();
                this._onSendMessage(html);
            }
        });
        
        // Listeners para ações rápidas
        html.find('#start-adventure').on('click', () => this._onStartAdventure(html));
        html.find('#describe-scene').on('click', () => this._onDescribeScene(html));
        html.find('#generate-npc').on('click', () => this._onGenerateNPC(html));
        html.find('#clear-chat').on('click', () => this._onClearChat(html));
        
        // Auto-scroll para o final do chat
        this._scrollToBottom(html);
    }
    
    /**
     * Envia mensagem para a IA
     */
    async _onSendMessage(html) {
        const input = html.find('#message-input');
        const message = input.val().trim();
        
        if (!message) return;
        
        const apiKey = game.settings.get('ai-dungeon-master-pf2e', 'geminiApiKey');
        if (!apiKey) {
            ui.notifications.error('Configure sua chave API do Google Gemini nas configurações do módulo!');
            return;
        }
        
        // Limpar input
        input.val('');
        
        // Adicionar mensagem do usuário ao histórico
        this.conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });
        
        this.render();
        
        try {
            // Inicializar Gemini se necessário
            if (!this.gemini) {
                const model = game.settings.get('ai-dungeon-master-pf2e', 'geminiModel');
                this.gemini = new GeminiAPI(apiKey, model);
            }
            
            // Enviar para a IA
            const response = await this.gemini.continueNarrative(message);
            
            // Adicionar resposta ao histórico
            this.conversationHistory.push({
                role: 'assistant',
                content: response,
                timestamp: new Date()
            });
            
            this.render();
        } catch (error) {
            console.error('AI DM | Erro ao enviar mensagem:', error);
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
            ui.notifications.warn('Selecione um token de personagem primeiro!');
            return;
        }
        
        new Dialog({
            title: 'Iniciar Aventura Solo',
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
                    label: 'Começar Aventura',
                    callback: async (html) => {
                        const formData = new FormDataExtended(html.find('form')[0]).object;
                        await this._beginAdventure(token, formData);
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancelar'
                }
            },
            default: 'start'
        }).render(true);
    }
    
    async _beginAdventure(token, params) {
        const apiKey = game.settings.get('ai-dungeon-master-pf2e', 'geminiApiKey');
        if (!apiKey) {
            ui.notifications.error('Configure sua chave API primeiro!');
            return;
        }
        
        try {
            if (!this.gemini) {
                const model = game.settings.get('ai-dungeon-master-pf2e', 'geminiModel');
                this.gemini = new GeminiAPI(apiKey, model);
            }
            
            const adventureParams = {
                characterName: token.name,
                characterClass: token.actor?.class?.name || 'Aventureiro',
                characterLevel: token.actor?.level || 1,
                theme: params.theme,
                setting: params.setting
            };
            
            const intro = await this.gemini.startSoloAdventure(adventureParams);
            
            this.adventureStarted = true;
            this.characterInfo = adventureParams;
            
            this.conversationHistory.push({
                role: 'assistant',
                content: `**🎭 AVENTURA INICIADA**\n\n${intro}`,
                timestamp: new Date()
            });
            
            this.render();
            ui.notifications.info('Aventura solo iniciada! Boa sorte!');
        } catch (error) {
            console.error('AI DM | Erro ao iniciar aventura:', error);
            ui.notifications.error('Erro ao iniciar aventura');
        }
    }
    
    /**
     * Gera descrição da cena atual
     */
    async _onDescribeScene(html) {
        if (!canvas.scene) {
            ui.notifications.warn('Nenhuma cena ativa!');
            return;
        }
        
        const apiKey = game.settings.get('ai-dungeon-master-pf2e', 'geminiApiKey');
        if (!apiKey) {
            ui.notifications.error('Configure sua chave API primeiro!');
            return;
        }
        
        try {
            if (!this.gemini) {
                this.gemini = new GeminiAPI(apiKey);
            }
            
            const sceneData = {
                name: canvas.scene.name,
                width: canvas.scene.width,
                height: canvas.scene.height,
                description: canvas.scene.journal?.content || ''
            };
            
            const description = await this.gemini.describeScene(sceneData);
            
            this.conversationHistory.push({
                role: 'assistant',
                content: `**Descrição da Cena: ${canvas.scene.name}**\n\n${description}`,
                timestamp: new Date()
            });
            
            this.render();
        } catch (error) {
            console.error('AI DM | Erro ao descrever cena:', error);
            ui.notifications.error('Erro ao gerar descrição da cena');
        }
    }
    
    /**
     * Abre diálogo para gerar NPC
     */
    async _onGenerateNPC(html) {
        new Dialog({
            title: 'Gerar NPC',
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
                    label: 'Gerar',
                    callback: async (html) => {
                        const formData = new FormDataExtended(html.find('form')[0]).object;
                        await this._generateNPC(formData);
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancelar'
                }
            },
            default: 'generate'
        }).render(true);
    }
    
    async _generateNPC(params) {
        const apiKey = game.settings.get('ai-dungeon-master-pf2e', 'geminiApiKey');
        if (!apiKey) {
            ui.notifications.error('Configure sua chave API primeiro!');
            return;
        }
        
        try {
            if (!this.gemini) {
                this.gemini = new GeminiAPI(apiKey);
            }
            
            const npc = await this.gemini.generateNPC(params);
            
            this.conversationHistory.push({
                role: 'assistant',
                content: `**NPC Gerado**\n\n${npc.description}`,
                timestamp: new Date()
            });
            
            this.render();
        } catch (error) {
            console.error('AI DM | Erro ao gerar NPC:', error);
            ui.notifications.error('Erro ao gerar NPC');
        }
    }
    
    /**
     * Solicita ajuda com regras
     */
    async _onRuleHelp(html) {
        new Dialog({
            title: 'Ajuda com Regras PF2e',
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
                    label: 'Perguntar',
                    callback: async (html) => {
                        const query = html.find('[name="query"]').val();
                        if (query) {
                            await this._askRuleHelp(query);
                        }
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancelar'
                }
            },
            default: 'ask'
        }).render(true);
    }
    
    async _askRuleHelp(query) {
        const apiKey = game.settings.get('ai-dungeon-master-pf2e', 'geminiApiKey');
        if (!apiKey) {
            ui.notifications.error('Configure sua chave API primeiro!');
            return;
        }
        
        try {
            if (!this.gemini) {
                this.gemini = new GeminiAPI(apiKey);
            }
            
            const help = await this.gemini.getRuleHelp(query);
            
            this.conversationHistory.push({
                role: 'user',
                content: query,
                timestamp: new Date()
            });
            
            this.conversationHistory.push({
                role: 'assistant',
                content: `**Ajuda com Regras**\n\n${help}`,
                timestamp: new Date()
            });
            
            this.render();
        } catch (error) {
            console.error('AI DM | Erro ao obter ajuda:', error);
            ui.notifications.error('Erro ao obter ajuda com regras');
        }
    }
    
    /**
     * Limpa o histórico de chat
     */
    _onClearChat(html) {
        Dialog.confirm({
            title: 'Limpar Conversa',
            content: '<p>Tem certeza que deseja limpar toda a conversa?</p>',
            yes: () => {
                this.conversationHistory = [];
                if (this.gemini) {
                    this.gemini.clearHistory();
                }
                this.render();
            }
        });
    }
    
    /**
     * Faz scroll até o final do chat
     */
    _scrollToBottom(html) {
        const chatContent = html.find('.chat-content');
        if (chatContent.length) {
            chatContent[0].scrollTop = chatContent[0].scrollHeight;
        }
    }
    
    async _render(force, options) {
        await super._render(force, options);
        this._scrollToBottom(this.element);
    }
}

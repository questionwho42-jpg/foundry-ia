import { AIDungeonMasterApp } from './ai-dm-app.mjs';
import { GeminiAPI } from './gemini-api.mjs';
import { registerSettings } from './settings.mjs';

/**
 * Inicialização do módulo AI Dungeon Master
 */
Hooks.once('init', function() {
    console.log('AI Dungeon Master | Inicializando módulo');
    
    // Registrar configurações do módulo
    registerSettings();
    
    // Adicionar o módulo ao namespace global do jogo
    game.modules.get('ai-dungeon-master-pf2e').api = {
        AIDungeonMasterApp,
        GeminiAPI
    };
});

/**
 * Hook executado quando o jogo está pronto
 */
Hooks.once('ready', function() {
    console.log('AI Dungeon Master | Módulo carregado e pronto');
    
    // Verificar se a chave API está configurada
    const apiKey = game.settings.get('ai-dungeon-master-pf2e', 'geminiApiKey');
    if (!apiKey) {
        ui.notifications.warn('AI Dungeon Master: Configure sua chave API do Google Gemini nas configurações do módulo.');
    }
    
    // Adicionar botão ao controle de cenas se o usuário for GM
    if (game.user.isGM) {
        console.log('AI Dungeon Master | GM detectado, funcionalidades completas habilitadas');
    }
});

/**
 * Adicionar botão de controle da cena para abrir o AI DM
 */
Hooks.on('getSceneControlButtons', (controls) => {
    if (!game.user.isGM) return;
    
    const notesControl = controls.find(c => c.name === 'notes');
    if (notesControl) {
        notesControl.tools.push({
            name: 'ai-dungeon-master',
            title: 'AI Dungeon Master',
            icon: 'fas fa-robot',
            button: true,
            onClick: () => {
                new AIDungeonMasterApp().render(true);
            }
        });
    }
});

/**
 * Adicionar comando de chat para invocar o AI DM
 */
Hooks.on('chatMessage', (chatLog, message, chatData) => {
    if (message.startsWith('/aidm') || message.startsWith('/dm')) {
        const query = message.replace(/^\/(aidm|dm)\s*/, '');
        if (query) {
            handleAIDMChatCommand(query);
        } else {
            new AIDungeonMasterApp().render(true);
        }
        return false; // Previne o envio da mensagem normal
    }
});

/**
 * Processa comandos de chat do AI DM
 * @param {string} query - A pergunta ou comando do usuário
 */
async function handleAIDMChatCommand(query) {
    const apiKey = game.settings.get('ai-dungeon-master-pf2e', 'geminiApiKey');
    if (!apiKey) {
        ui.notifications.error('Configure sua chave API do Google Gemini primeiro!');
        return;
    }
    
    try {
        const gemini = new GeminiAPI(apiKey);
        const response = await gemini.chat(query, {
            systemContext: getGameContext()
        });
        
        // Enviar resposta como mensagem de chat
        ChatMessage.create({
            speaker: {
                alias: 'AI Dungeon Master'
            },
            content: `<div class="ai-dm-response">
                <h3><i class="fas fa-robot"></i> AI Dungeon Master</h3>
                <p>${response}</p>
            </div>`,
            whisper: game.user.isGM ? [] : [game.user.id]
        });
    } catch (error) {
        console.error('AI Dungeon Master | Erro ao processar comando:', error);
        ui.notifications.error('Erro ao comunicar com a IA. Verifique sua chave API e conexão.');
    }
}

/**
 * Obtém o contexto atual do jogo para fornecer à IA
 * @returns {string} Contexto formatado do jogo
 */
function getGameContext() {
    const context = {
        system: 'Pathfinder 2e',
        scene: canvas.scene?.name || 'Nenhuma cena ativa',
        activeTokens: canvas.tokens?.controlled.map(t => t.name) || [],
        party: game.actors?.filter(a => a.type === 'party').map(p => p.name) || []
    };
    
    return `Você é um assistente de Dungeon Master para Pathfinder 2e.
Sistema: ${context.system}
Cena atual: ${context.scene}
Tokens selecionados: ${context.activeTokens.join(', ') || 'Nenhum'}
Grupos na campanha: ${context.party.join(', ') || 'Nenhum'}

Forneça assistência narrativa, descrições criativas, sugestões de combate e ajuda com regras.
Responda de forma concisa e útil.`;
}

export { handleAIDMChatCommand, getGameContext };

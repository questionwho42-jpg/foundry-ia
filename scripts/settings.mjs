/**
 * Registra as configurações do módulo
 */
export function registerSettings() {
    // Chave API do Google Gemini
    game.settings.register('ai-dungeon-master-pf2e', 'geminiApiKey', {
        name: 'AIDM.Settings.ApiKey.Name',
        hint: 'AIDM.Settings.ApiKey.Hint',
        scope: 'world',
        config: true,
        type: String,
        default: '',
        onChange: value => {
            console.log('AI Dungeon Master | Chave API atualizada');
        }
    });
    
    // Modelo do Gemini a ser usado
    game.settings.register('ai-dungeon-master-pf2e', 'geminiModel', {
        name: 'AIDM.Settings.Model.Name',
        hint: 'AIDM.Settings.Model.Hint',
        scope: 'world',
        config: true,
        type: String,
        choices: {
            'gemini-1.5-flash': 'Gemini 1.5 Flash (Rápido)',
            'gemini-1.5-pro': 'Gemini 1.5 Pro (Avançado)',
            'gemini-2.0-flash-exp': 'Gemini 2.0 Flash Experimental'
        },
        default: 'gemini-1.5-flash'
    });
    
    // Temperatura da IA (criatividade)
    game.settings.register('ai-dungeon-master-pf2e', 'temperature', {
        name: 'AIDM.Settings.Temperature.Name',
        hint: 'AIDM.Settings.Temperature.Hint',
        scope: 'world',
        config: true,
        type: Number,
        range: {
            min: 0,
            max: 2,
            step: 0.1
        },
        default: 0.7
    });
    
    // Máximo de tokens na resposta
    game.settings.register('ai-dungeon-master-pf2e', 'maxTokens', {
        name: 'AIDM.Settings.MaxTokens.Name',
        hint: 'AIDM.Settings.MaxTokens.Hint',
        scope: 'world',
        config: true,
        type: Number,
        range: {
            min: 256,
            max: 8192,
            step: 256
        },
        default: 2048
    });
    
    // Mostrar notificações de IA em chat
    game.settings.register('ai-dungeon-master-pf2e', 'showChatNotifications', {
        name: 'AIDM.Settings.ChatNotifications.Name',
        hint: 'AIDM.Settings.ChatNotifications.Hint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });
    
    // Permitir que jogadores usem comandos de chat
    game.settings.register('ai-dungeon-master-pf2e', 'allowPlayerChatCommands', {
        name: 'AIDM.Settings.PlayerCommands.Name',
        hint: 'AIDM.Settings.PlayerCommands.Hint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });
}

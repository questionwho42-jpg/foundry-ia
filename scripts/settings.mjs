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
            'gemini-2.5-flash': 'Gemini 2.5 Flash (10 req/min) ⚡ RECOMENDADO GRÁTIS',
            'gemini-2.5-flash-8b': 'Gemini 2.5 Flash-8B (15 req/min) 💰 Econômico',
            'gemini-2.5-pro': 'Gemini 2.5 Pro (2 req/min) 🎯 Avançado - Requer Conta Paga'
        },
        default: 'gemini-2.5-flash',
        onChange: value => {
            const limits = {
                'gemini-2.5-pro': '2 requisições/min (apenas com conta paga)',
                'gemini-2.5-flash': '10 requisições/min (grátis)',
                'gemini-2.5-flash-8b': '15 requisições/min (grátis)'
            };
            ui.notifications.info(`Modelo alterado. Limite: ${limits[value]}`);
        }
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
            min: 512,
            max: 8192,
            step: 512
        },
        default: 4096,
        onChange: value => {
            if (value < 2048) {
                ui.notifications.warn('Valores abaixo de 2048 podem resultar em narrativas incompletas.');
            }
        }
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

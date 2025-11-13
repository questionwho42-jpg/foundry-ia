# Foundry VTT Module Development Instructions

## Project Context
- **Module Name**: AI Dungeon Master for PF2e
- **Foundry VTT Version**: v13
- **Game System**: Pathfinder 2e (PF2e)
- **AI Integration**: Google Gemini API
- **Primary Language**: JavaScript (ES6 modules)
- **Repository**: foundry-ia
- **Branch**: geracao-de-encontros

## Development Workflow
1. **Always ASK before making large refactorings or architectural changes**
2. Follow Foundry VTT's code structure and naming conventions
3. Test manually in Foundry after each change
4. Use `deploy-to-foundry.ps1` for deployment
5. Always hard-reload Foundry (Ctrl+Shift+R) after deploy
6. Create both manual and automated tests when applicable

## Code Standards
- **Use Foundry's existing patterns** (match their style)
- Prefer ES6 class syntax over prototypes
- Use async/await for asynchronous operations
- **Comments in Portuguese (PT-BR)**
- **Method names in English**
- Include error handling with try/catch
- Log important events with `console.log("ModuleName | Message")`

## Key APIs Used

### Hooks System
```javascript
Hooks.on("eventName", (data) => { /* ... */ });
Hooks.once("ready", () => { /* ... */ });
```

### Settings API
```javascript
game.settings.register("module-id", "settingName", {
  name: "Display Name",
  scope: "world", // or "client"
  config: true,
  type: String,
  default: "value"
});
```

### Chat Messages
```javascript
ChatMessage.create({
  content: htmlContent,
  speaker: ChatMessage.getSpeaker(),
  flags: { "module-id": { customData } }
});
```

### Token Manipulation
```javascript
const tokenDoc = canvas.tokens.get(tokenId).document;
await tokenDoc.update({ x: newX, y: newY });
```

### Combat Tracker
```javascript
game.combat.combatant // current combatant
game.combat.combatants // all combatants
```

## File Structure
```
C:\foundry-ia\
├── scripts/
│   ├── main.mjs           # Entry point, module initialization
│   ├── gemini-api.mjs     # Gemini API communication
│   ├── combat-ai.mjs      # Combat AI tactical decisions
│   └── scene-generator.mjs # Scene/encounter generation
├── templates/
│   └── *.html             # Handlebars templates
├── styles/
│   └── module.css         # Custom styles
├── module.json            # Module manifest
└── deploy-to-foundry.ps1  # Deployment script
```

## Deployment Process
- **Dev Directory**: `C:\foundry-ia\`
- **Production Directory**: `%LOCALAPPDATA%\FoundryVTT\Data\modules\ai-dungeon-master-pf2e\`
- **Command**: `.\deploy-to-foundry.ps1`
- **Reload**: Ctrl+Shift+R in Foundry

## Gemini API Integration

### Rate Limiting
- **gemini-2.5-pro**: 30 seconds between requests
- **gemini-2.5-flash**: 6 seconds between requests
- **gemini-2.5-flash-8b**: 4 seconds between requests

### Best Practices
- Use lower temperature (0.7) for tactical decisions
- Use higher temperature (1.2) for creative content
- Keep maxTokens reasonable (500 for decisions, 2000 for generation)
- Always handle JSON parsing errors with fallbacks
- Check for safety filters in responses

## PF2e System Specifics

### Token Disposition
- `-1` = Enemy (hostile)
- `0` = Neutral
- `1` = Ally (friendly)

### Actor Types
- `"character"` = Player character
- `"npc"` = Non-player character

### Token vs TokenDocument
- `currentCombatant.token` = TokenDocument (has `.disposition`, `.name`)
- `currentCombatant.actor` = Actor (has `.type`, `.system`)
- `tokenDoc.object` = Token (for canvas coordinates)

## Common Patterns

### Checking if User is GM
```javascript
if (!game.user.isGM) return;
```

### Getting Combat State
```javascript
const combatant = game.combat.combatant;
const tokenDoc = combatant.token;
const actor = combatant.actor;
```

### Creating Chat Cards with Buttons
```javascript
const content = `
  <div class="ai-suggestion-card">
    <h3>${title}</h3>
    <p>${description}</p>
    <button class="ai-action-btn" data-action="action-name">Button</button>
  </div>
`;
await ChatMessage.create({ content });
```

### jQuery Event Handlers (Foundry uses jQuery)
```javascript
$(document).on("click", ".ai-action-btn", async (event) => {
  const action = $(event.currentTarget).data("action");
  // Handle action
});
```

## Debugging Tips
- Use `console.log("ModuleName | Context:", data)` for logging
- Check browser console (F12) for errors
- Use `JSON.stringify(object, null, 2)` for readable output
- Test with simple NPCs before complex encounters
- Verify API key is set in module settings

## Testing Workflow
1. Make changes in `C:\foundry-ia\`
2. Run `.\deploy-to-foundry.ps1`
3. Reload Foundry with Ctrl+Shift+R
4. Check console for initialization messages
5. Test feature manually
6. Check for errors in console

## Important Reminders
- **User is learning Foundry development** - provide explanations
- **Always ask before major architectural changes**
- **Match Foundry's existing code style**
- **Test after every significant change**
- **Handle errors gracefully with user-friendly messages**
- **API keys stored in Foundry settings, never hardcoded**

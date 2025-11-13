"""
Script para corrigir decideNPCAction:
1. Aumentar maxTokens de 2048 para 5000
2. Corrigir acesso às ações do NPC (itemTypes.melee em vez de system.actions)
"""

file_path = "scripts/gemini-api.mjs"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Aumentar maxTokens para 5000
if "maxTokens: 2048," in content:
    content = content.replace("maxTokens: 2048,", "maxTokens: 5000,")
    print("✅ Fix 1: maxTokens aumentado de 2048 para 5000")
else:
    print("⏭️  Fix 1: maxTokens já está correto ou não encontrado")

# Fix 2: Corrigir acesso às ações do NPC
# Procurar por: npc.system.actions?.map(a => `- ${a.name}`).join('\n') || '- Ataque básico'
old_actions = "npc.system.actions?.map(a => `- ${a.name}`).join('\\n') || '- Ataque básico'"
new_actions = "npc.itemTypes.melee?.map(m => `- ${m.name} (+${m.system?.bonus?.value || 0})`).join('\\n') || '- Ataque básico'"

if old_actions in content:
    content = content.replace(old_actions, new_actions)
    print("✅ Fix 2: Acesso às ações corrigido (system.actions → itemTypes.melee)")
else:
    print("⏭️  Fix 2: Ações já corrigidas ou padrão diferente")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("\n🎯 Correções aplicadas com sucesso!")
print("📝 Próximos passos:")
print("   1. Execute: .\\deploy-to-foundry.ps1")
print("   2. Recarregue Foundry (Ctrl+Shift+R)")
print("   3. Teste o turno do Apprentice novamente")

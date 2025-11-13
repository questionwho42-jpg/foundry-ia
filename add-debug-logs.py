"""
Script para adicionar logs de debug no método decideNPCAction
"""

file_path = "scripts/gemini-api.mjs"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Log 1: Início do método
if "async decideNPCAction(npcTokenDoc, combatState) {" in content and "console.log('Combat AI | 🎯" not in content:
    content = content.replace(
        "async decideNPCAction(npcTokenDoc, combatState) {\n    const npc = npcTokenDoc.actor;",
        "async decideNPCAction(npcTokenDoc, combatState) {\n    console.log('Combat AI | 🎯 decideNPCAction chamado para:', npcTokenDoc.name);\n    const npc = npcTokenDoc.actor;"
    )
    print("✅ Log 1 adicionado (início do método)")
else:
    print("⏭️  Log 1 já existe")

# Log 2: Antes de chamar Gemini
if "const response = await this.chat(prompt, {" in content and "console.log('Combat AI | 🤖" not in content:
    content = content.replace(
        "const response = await this.chat(prompt, {",
        "console.log('Combat AI | 🤖 Enviando prompt para Gemini...', prompt.substring(0, 200));\n    const response = await this.chat(prompt, {"
    )
    print("✅ Log 2 adicionado (antes de chamar API)")
else:
    print("⏭️  Log 2 já existe")

# Log 3: Depois de receber resposta
if "try {\n      // Limpar resposta" in content and "console.log('Combat AI | ✅ Resposta" not in content:
    content = content.replace(
        "try {\n      // Limpar resposta",
        "console.log('Combat AI | ✅ Resposta recebida do Gemini:', response.substring(0, 200));\n    try {\n      // Limpar resposta"
    )
    print("✅ Log 3 adicionado (resposta recebida)")
else:
    print("⏭️  Log 3 já existe")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("\n🎯 Logs de debug adicionados com sucesso!")

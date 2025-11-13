# Prompt de Implementação: Melhorias na Geração de Cenas

## Objetivo

Implementar 3 melhorias na geração automática de cenas de combate:

1. Adicionar token do jogador automaticamente à cena
2. Usar criaturas do compendium ao invés de criar NPCs novos
3. Adicionar objetos decorativos usando Drawing Tools (mesas, caixas, barris, etc)

## Modificação 1: gemini-api.mjs - Adicionar Objetos ao Prompt

**Localização:** Linha 270-282 (método `generateCombatScene`)

**Código Atual:**

```javascript
const prompt = `Cena de combate para Pathfinder 2e:
Local: ${locationType}
Inimigos: ${enemyCount}

Forneça APENAS:
1. Nome da cena (curto)
2. Descrição (1 frase)
3. Nome de ${enemyCount} inimigos apropriados para ${locationType}

Exemplo:
Nome: Taverna Sombria
Descrição: Mobília quebrada e cheiro de cerveja.
Inimigos: Bandido, Capanga`;
```

**Código Novo:**

```javascript
const prompt = `Cena de combate para Pathfinder 2e:
Local: ${locationType}
Inimigos: ${enemyCount}

Forneça APENAS:
1. Nome da cena (curto)
2. Descrição (1 frase)
3. Nome de ${enemyCount} inimigos apropriados para ${locationType}
4. Objetos (2-4 itens: mesa, caixa, barril, pedra, altar, etc)

Exemplo:
Nome: Taverna Sombria
Descrição: Mobília quebrada e cheiro de cerveja.
Inimigos: Bandido, Capanga
Objetos: Mesa grande, Barril, Cadeiras quebradas`;
```

## Modificação 2: gemini-api.mjs - Extrair e Retornar Objetos

**Localização:** Após linha 292 (onde extrai enemies)

**Adicionar:**

```javascript
const objectsMatch = response.match(/Objetos?:\s*(.+)/i);
const objectNames = objectsMatch
  ? objectsMatch[1]
      .split(",")
      .map((o) => o.trim())
      .slice(0, 4)
  : ["Mesa", "Caixa"];
```

**Localização:** Após linha 337 (antes de retornar enemies)

**Adicionar:**

```javascript
// Gerar objetos decorativos espalhados pela sala
const objects = objectNames.map((name, i) => {
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
```

**Localização:** Linha 352-359 (objeto de retorno)

**Modificar para:**

```javascript
return {
  sceneName,
  description,
  gridSize,
  walls,
  lights,
  playerStart: { x: roomWidth / 2, y: roomHeight - 2 },
  enemies,
  objects, // ADICIONAR ESTA LINHA
};
```

## Modificação 3: ai-dm-app.mjs - Buscar Criaturas do Compendium

**Localização:** Linha 391-407 (criação de NPCs)

**Código Atual:**

```javascript
// Criar NPCs inimigos e colocar tokens
if (sceneData.enemies && sceneData.enemies.length > 0) {
  for (const enemy of sceneData.enemies) {
    // Criar ator NPC
    const actor = await Actor.create({
      name: enemy.name || "Inimigo",
      type: "npc",
      img: "icons/svg/mystery-man.svg",
      system: {
        details: {
          level: { value: enemy.level || 1 },
        },
      },
    });

    // Colocar token na cena
    await scene.createEmbeddedDocuments("Token", [
      {
        name: actor.name,
        actorId: actor.id,
        x: enemy.x * gridSize,
        y: enemy.y * gridSize,
        disposition: -1, // Hostil
      },
    ]);
  }
}
```

**Código Novo:**

```javascript
// Buscar criaturas do compendium e colocar tokens
if (sceneData.enemies && sceneData.enemies.length > 0) {
  for (const enemy of sceneData.enemies) {
    // Buscar no compendium de bestiário PF2e
    const packs = game.packs.filter(
      (p) => p.metadata.type === "Actor" && p.metadata.name.includes("bestiary")
    );
    let actor = null;

    // Tentar encontrar criatura por nome
    for (const pack of packs) {
      const index = await pack.getIndex();
      const entry = index.find(
        (e) =>
          e.name.toLowerCase().includes(enemy.name.toLowerCase()) ||
          enemy.name.toLowerCase().includes(e.name.toLowerCase())
      );

      if (entry) {
        actor = await pack.getDocument(entry._id);
        break;
      }
    }

    // Se não encontrou no compendium, criar genérico
    if (!actor) {
      console.warn(
        `AI DM | Criatura "${enemy.name}" não encontrada no compendium, criando genérica`
      );
      actor = await Actor.create({
        name: enemy.name || "Inimigo",
        type: "npc",
        img: "icons/svg/mystery-man.svg",
        system: {
          details: {
            level: { value: enemy.level || 1 },
          },
        },
      });
    }

    // Colocar token na cena
    await scene.createEmbeddedDocuments("Token", [
      {
        name: actor.name,
        actorId: actor.id,
        actorLink: false, // Não linkar (criar cópia única)
        x: enemy.x * gridSize,
        y: enemy.y * gridSize,
        disposition: -1, // Hostil
      },
    ]);
  }
}
```

## Modificação 4: ai-dm-app.mjs - Adicionar Token do Jogador

**Localização:** ANTES da linha 417 (antes de "// Ativar a cena")

**Adicionar:**

```javascript
// Adicionar token do jogador
const playerToken = canvas.tokens?.controlled[0];
if (playerToken && playerToken.actor) {
  const playerStartX = sceneData.playerStart.x * gridSize;
  const playerStartY = sceneData.playerStart.y * gridSize;

  await scene.createEmbeddedDocuments("Token", [
    {
      name: playerToken.actor.name,
      actorId: playerToken.actor.id,
      actorLink: true, // Linkar ao ator original
      x: playerStartX,
      y: playerStartY,
      disposition: 1, // Amigável
      hidden: false,
      vision: true,
    },
  ]);

  ui.notifications.info(
    `Token de ${playerToken.actor.name} adicionado à cena!`
  );
} else {
  ui.notifications.warn(
    "Nenhum token selecionado. Selecione seu personagem antes de gerar a cena."
  );
}
```

## Modificação 5: ai-dm-app.mjs - Desenhar Objetos

**Localização:** ANTES da linha 417 (após adicionar token do jogador)

**Adicionar:**

```javascript
// Desenhar objetos decorativos
if (sceneData.objects && sceneData.objects.length > 0) {
  const drawings = sceneData.objects.map((obj) => ({
    x: obj.x * gridSize,
    y: obj.y * gridSize,
    shape: {
      type: "r", // Retângulo
      width: obj.width * gridSize,
      height: obj.height * gridSize,
    },
    fillColor: "#8B4513", // Marrom
    fillAlpha: 0.5,
    strokeWidth: 2,
    strokeColor: "#000000",
    strokeAlpha: 1,
    text: obj.name,
    textColor: "#FFFFFF",
    textAlpha: 1,
    fontSize: 24,
    fontFamily: "Signika",
  }));

  await scene.createEmbeddedDocuments("Drawing", drawings);
  ui.notifications.info(
    `${sceneData.objects.length} objetos adicionados à cena!`
  );
}
```

## Resumo das Modificações

### Arquivo: scripts/gemini-api.mjs

- Linha 277: Adicionar linha "4. Objetos (2-4 itens...)" ao prompt
- Linha 282: Adicionar "Objetos: Mesa grande, Barril, Cadeiras quebradas" ao exemplo
- Após linha 292: Extrair `objectsMatch` e `objectNames`
- Após linha 337: Gerar array `objects` com posições aleatórias
- Linha 359: Adicionar `objects` ao objeto de retorno

### Arquivo: scripts/ai-dm-app.mjs

- Linhas 391-407: Substituir criação de Actor por busca no compendium
- Antes linha 417: Adicionar token do jogador na posição inicial
- Antes linha 417: Criar desenhos (drawings) para objetos

## Resultado Esperado

Ao gerar uma cena de combate:

1. ✅ Cena criada com paredes e iluminação
2. ✅ Inimigos do compendium posicionados (ou genéricos se não encontrados)
3. ✅ Token do jogador adicionado na posição inicial
4. ✅ Objetos desenhados (mesas, caixas, etc) com labels
5. ✅ Cena ativada automaticamente

## Testagem

1. Selecionar um token de personagem
2. Abrir AI DM App
3. Clicar em "Gerar Cena de Combate"
4. Preencher: Taverna, Nível 3, 2 inimigos, Moderado
5. Verificar:
   - Cena criada com nome sugestivo
   - 2 inimigos do bestiário (ex: "Goblin Warrior")
   - Token do jogador no sul da sala
   - 2-4 objetos desenhados (mesa, barril, etc)
   - Paredes formando sala
   - 4 tochas iluminando

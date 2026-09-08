

// Resources
let stick = 0;
let stone = 0;
let thatch = 0;
let crudeRope = 0;
let meat = 0;
let dirt = 0;
let water = 0;
let clay = 0;
let rawMetal = 0;
let scrap = 0;
let cloth = 0;
let gear = 0;
let wire = 0;
let blueprint = 0;
let explorationLog = []; 
let driedBrick = 0;
let wetBrick= 0;

// Items with tiers
let items = [
  { name: "craftingTable", tier: 0 },
  { name: "knife", tier: 0 },
  { name: "pickaxe", tier: 0 },
  { name: "bucket", tier: 0 },
  { name: "spear", tier: 0 },
  { name: "shovel", tier: 0 },
  { name: "axe", tier: 0 },
  { name: "brickForm", tier: 0 }
];

// Bucket capacity by tier
const bucketCapacityByTier = { 0: 0, 1: 1, 2: 5, 3: 10, 4: 25, 5: 50 };

// Helpers
window.updateItemTier = function(itemName, newTier) {
  let item = items.find(i => i.name === itemName);
  if (item) {
    item.tier = newTier;
    updateInventoryDisplay();
  }
}

window.getTier = function(itemName) {
  let item = items.find(i => i.name === itemName);
  return item ? item.tier : 0;
}

window.show = function(id) { let el = document.getElementById(id); if (el) el.style.display = "block"; }
window.hide = function(id) { let el = document.getElementById(id); if (el) el.style.display = "none"; }

// Tab switching (unused with 3-panel layout)
function tabSwitch(id) {
  let children = document.querySelectorAll("#gameArea > *");
  children.forEach(child => {
    if (child.id === "tabBar") show(child.id);
    else if (child.id === id) show(child.id);
    else hide(child.id);
  });
  console.log("Switched to tab:", id);
};

function setSlotTab(slotIndex, tabId) {
  const slotContent = document.getElementById(`slot${slotIndex}Content`);
  const templates = document.getElementById("tabTemplates");
  if (!slotContent || !templates) return;

  const currentTab = slotContent.firstElementChild;
  if (currentTab && currentTab.id !== tabId) {
    templates.appendChild(currentTab);
  }

  const targetTab = document.getElementById(tabId);
  if (!targetTab) return;
  slotContent.appendChild(targetTab);
};

// Begin game
function beginGame() {
  hide("begin");
  show("gameArea");
  show("tabBar");
  setSlotTab(1, "forest");
  setSlotTab(2, "inventory");
  setSlotTab(3, "crafting");
  updateInventoryDisplay();
  refreshUnlocks();
  renderExplorationLog();
};

// Inventory display
window.updateInventoryDisplay = function() {
  const el = document.getElementById("inventoryDisplay");
  if (!el) return;

  const bucketTier = getTier("bucket");
  const bucketCapacity = bucketCapacityByTier[bucketTier];

  el.innerHTML = `
    <h3>Inventory</h3>
    <ul>
      ${stick ? `<li>Sticks: ${stick}</li>` : ""}
      ${stone ? `<li>Stones: ${stone}</li>` : ""}
      ${thatch ? `<li>Thatch: ${thatch}</li>` : ""}
      ${crudeRope ? `<li>Crude Rope: ${crudeRope}</li>` : ""}
      ${meat ? `<li>Meat: ${meat}</li>` : ""}
      ${dirt ? `<li>Dirt: ${dirt}</li>` : ""}
      ${clay ? `<li>Clay: ${clay}</li>` : ""}
      ${rawMetal ? `<li>Raw Metal: ${rawMetal}</li>` : ""}
      ${scrap ? `<li>Scrap: ${scrap}</li>` : ""}
      ${cloth ? `<li>Old Cloth: ${cloth}</li>` : ""}
      ${gear ? `<li>Rusty Gear: ${gear}</li>` : ""}
      ${wire ? `<li>Ancient Wire: ${wire}</li>` : ""}
      ${blueprint ? `<li>Blueprint Fragment: ${blueprint}</li>` : ""}
      ${bucketTier > 0 ? `<li>Bucket: ${water}/${bucketCapacity} water</li>` : ""}
      ${items.filter(i => i.tier > 0).map(i => `<li>${i.name} (Tier ${i.tier})</li>`).join("")}
      ${wetBrick ? `<li>Wet Brick: ${wetBrick}</li>` : ""}
      ${driedBrick ? `<li>Dried Brick: ${driedBrick}</li>` : ""}
    </ul>
  `;

  if (getTier("craftingTable") === 0 && stick >= 10 && stone >= 5) show("makeT1Crafting");
  else hide("makeT1Crafting");

  refreshContextButtons();
  refreshUnlocks();
}

window.refreshContextButtons = function() {
  if (getTier("bucket") > 0) show("fillBucket"); else hide("fillBucket");
  if (getTier("shovel") > 0) show("mineDirt"); else hide("mineDirt");
  if (getTier("pickaxe") > 0) { show("mineStoneMetal"); show("rawMetalBtn"); }
  else { hide("mineStoneMetal"); hide("rawMetalBtn"); }
  if (getTier("spear") > 0) show("huntBtn"); else hide("huntBtn");
}

window.refreshUnlocks = function() {
  setOptionEnabled("crafting", getTier("craftingTable") > 0);
  setOptionEnabled("cave", window.__caveDiscovered);
  setOptionEnabled("hunting", getTier("spear") > 0);
  setCraftingTierOptionEnabled(getTier("craftingTable") >= 2);
  if (getTier("craftingTable") >= 2) show("exploreMoreBtn"); else hide("exploreMoreBtn");
}

window.setOptionEnabled = function(optionValue, enabled) {
  ["slot1Select", "slot2Select", "slot3Select"].forEach(selectId => {
    const select = document.getElementById(selectId);
    if (!select) return;
    const option = select.querySelector(`option[value="${optionValue}"]`);
    if (option) {
      option.disabled = !enabled;
      if (!enabled && select.value === optionValue) {
        select.value = "forest";
        setSlotTab(parseInt(selectId.slice(4), 10), "forest");
      }
    }
  });
}

function setCraftingTierOptionEnabled(enabled) {
  const select = document.getElementById("craftingTierSelect");
  if (!select) return;
  const option = select.querySelector("option[value='t2']");
  if (!option) return;
  option.disabled = !enabled;
  if (!enabled && select.value === "t2") {
    select.value = "t1";
    setCraftingTier("t1");
  }
}

window.setAllBooleansTrue = function() {
  Object.keys(window).forEach(key => {
    if (key.startsWith("__") && typeof window[key] === "boolean") {
      window[key] = true;
    }
  });

  const maxTiers = {
    craftingTable: 2,
    knife: 1,
    pickaxe: 1,
    bucket: 2,
    spear: 1,
    shovel: 1,
    axe: 1
  };

  Object.entries(maxTiers).forEach(([name, tier]) => updateItemTier(name, tier));

  const craftingTierSelect = document.getElementById("craftingTierSelect");
  if (craftingTierSelect) craftingTierSelect.value = "t2";
  setCraftingTier("t2");

  refreshUnlocks();
  updateInventoryDisplay();
};

window.setCraftingTier = function(tier) {
  const t1 = document.getElementById("craftingT1");
  const t2 = document.getElementById("craftingT2");
  if (!t1 || !t2) return;
  if (tier === "t2" && getTier("craftingTable") >= 2) {
    hide("craftingT1");
    show("craftingT2");
  } else {
    show("craftingT1");
    hide("craftingT2");
  }
}

function exploreMore() {
  const result = document.getElementById("exploreResult");
  if (!result) return;

  const found = Math.random() < 0.1;
  let logMessage;

  if (!found) {
    result.textContent = "You explore the area, but the old buildings remain hidden.";
    logMessage = "Explored the surroundings and found nothing.";
  } else {
    const loot = getOldBuildingLoot();
    addLoot(loot);
    result.innerHTML = `You found an old building and recovered <span class="rarity ${loot.rarity}">${loot.name}</span>.`;
    logMessage = `Found an old building and recovered ${loot.name} (${loot.rarity}).`;
  }

  logExploration(logMessage);
};

function logExploration(message) {
  explorationLog.unshift(message);
  if (explorationLog.length > 10) explorationLog.pop();
  renderExplorationLog();
}

function renderExplorationLog() {
  const logContainer = document.getElementById("explorationLogEntries");
  if (!logContainer) return;
  if (explorationLog.length === 0) {
    logContainer.innerHTML = "<div class=\"explorationEntry\">No exploration activity yet.</div>";
    return;
  }

  logContainer.innerHTML = explorationLog
    .map(entry => `<div class="explorationEntry">${entry}</div>`)
    .join("");
}

function getOldBuildingLoot() {
  const lootTable = [
    { name: "Scrap metal", key: "scrap", rarity: "common", weight: 20 },
    { name: "Old cloth", key: "cloth", rarity: "common", weight: 15 },
    { name: "Rusty gear", key: "gear", rarity: "uncommon", weight: 10 },
    { name: "Ancient wire", key: "wire", rarity: "rare", weight: 5 },
    { name: "Blueprint fragment", key: "blueprint", rarity: "epic", weight: 2 }
  ];

  const totalWeight = lootTable.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const item of lootTable) {
    if (roll < item.weight) return item;
    roll -= item.weight;
  }
  return lootTable[lootTable.length - 1];
}

function addLoot(item) {
  if (!item || !item.key) return;

  switch (item.key) {
    case "scrap": scrap++; break;
    case "cloth": cloth++; break;
    case "gear": gear++; break;
    case "wire": wire++; break;
    case "blueprint": blueprint++; break;
  }

  updateInventoryDisplay();
}

// Forest collection
function collectStick() {
  let tier = getTier("axe");
  stick += tier === 0 ? 1 : 10 ** tier;
  updateInventoryDisplay();
};

function collectStone() {
  let tier = getTier("pickaxe");
  stone += tier === 0 ? 1 : 10 ** tier;
  updateInventoryDisplay();
};

// Explore
function fillBucket() {
  let capacity = bucketCapacityByTier[getTier("bucket")];
  if (capacity > 0) { water = capacity; updateInventoryDisplay(); }
};

function mineDirt() {
  if (getTier("shovel") > 0) { 
    dirt += getTier("shovel") * 3;
     updateInventoryDisplay(); 
     }
};

function discoverCave() {
  window.__caveDiscovered = true;
  refreshUnlocks();
  hide("search");
};

// Cave
function mineCave() {
  if (getTier("pickaxe") > 0) { stone += 3; rawMetal += 1; updateInventoryDisplay(); }
};

function collectRawMetal() {
  if (getTier("pickaxe") > 0) { rawMetal++; updateInventoryDisplay(); }
};

// Hunting
function huntMeat() {
  if (getTier("spear") > 0) { meat += getTier("spear") * 5; updateInventoryDisplay(); }
};

// Crafting
function makeT1CraftingTable() {
  if (stick >= 10 && stone >= 5 && getTier("craftingTable") === 0) {
    stick -= 10; stone -= 5;
    updateItemTier("craftingTable", 1);
    show("craftingTab");
    hide("makeT1CraftingTable")
  }
};

function makeKnife() {
  if (stick >= 10 && stone >= 15 && getTier("knife") === 0) {
    stick -= 10; stone -= 15;
    updateItemTier("knife", 1);
    hide("makeKnife")
  }
};

function makeThatch() {
  if (getTier("knife") > 0 && stick >= 1) { stick--; thatch++; updateInventoryDisplay(); }
};

function makeRope() {
  if (thatch >= 25) { thatch -= 25; crudeRope++; updateInventoryDisplay(); }
};

function makePickaxe() {
  if (stick >= 20 && stone >= 25 && getTier("pickaxe") === 0) {
    stick -= 20; stone -= 25;
    updateItemTier("pickaxe", 1);
    hide("makePickaxe")
  }
};

function makeShovel() {
  if (stick >= 15 && stone >= 10 && getTier("shovel") === 0) {
    stick -= 15; stone -= 10;
    updateItemTier("shovel", 1);
    hide("makeShovel")
  }
};

function makeBucket() {
  if (stone >= 50 && getTier("bucket") === 0) {
    stone -= 50;
    updateItemTier("bucket", 1);
    hide("makeBucket")
  }
};

function makeSpear() {
  if (stick >= 30 && stone >= 15 && getTier("spear") === 0) {
    stick -= 30; stone -= 15;
    updateItemTier("spear", 1);
    refreshUnlocks();
    hide("makeSpear")
  }
};

function makeClay() {
  if (dirt >= 5 && water > 0) { dirt -= 5; water--; clay++; updateInventoryDisplay(); }
};

function upgradeBucket() {
  if (rawMetal >= 20 && clay >= 10) {
    rawMetal -= 20; clay -= 10;
    updateItemTier("bucket", 2);
    updateInventoryDisplay();
    hide("upgradeBucket")
  }
};

function makeT2CraftingTable() {
  if (rawMetal >= 30 && clay >= 15 && crudeRope >= 5 && getTier("craftingTable") < 2) {
    rawMetal -= 30; clay -= 15; crudeRope -= 5;
    updateItemTier("craftingTable", 2);
    setCraftingTier("t2");
    const slotSelects = ["slot1Select", "slot2Select", "slot3Select"];
    slotSelects.forEach(selectId => {
      const select = document.getElementById(selectId);
      if (select && select.value === "crafting") {
        const craftingTier = document.getElementById("craftingTierSelect");
        if (craftingTier) craftingTier.value = "t2";
      }
    });
    hide("makeT2Crafting")
  }
};

function makeBrickForm() {
  if (clay >= 15 && stone >= 10 && getTier("craftingTable") >= 2) {
    clay -= 15; stone -= 10;
    updateItemTier("brickForm", 0.5);
    hide("makeBrickForm");
    show("dryBrickForm")
  }
}

function dryBrickForm() {
  if (getTier("brickForm") > 0) {
    updateItemTier("brickForm", 1);
    updateInventoryDisplay();
  }
};

window.__caveDiscovered = false;

Object.assign(window, {
    stick,
    stone,
    thatch,
    crudeRope,
    meat,
    dirt,
    water,
    clay,
    rawMetal,
    scrap,
    cloth,
    gear,
    wire,
    blueprint,
    driedBrick,
    wetBrick
});


window.items = items;





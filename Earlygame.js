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

// Items with tiers
let items = [
  { name: "craftingTable", tier: 0 },
  { name: "knife", tier: 0 },
  { name: "pickaxe", tier: 0 },
  { name: "bucket", tier: 0 },
  { name: "spear", tier: 0 },
  { name: "shovel", tier: 0 },
  { name: "axe", tier: 0 }
];

// Bucket capacity by tier
const bucketCapacityByTier = { 0: 0, 1: 1, 2: 5, 3: 10, 4: 15, 5: 20 };

// Helpers
function updateItemTier(itemName, newTier) {
  let item = items.find(i => i.name === itemName);
  if (item) {
    item.tier = newTier;
    updateInventoryDisplay();
  }
}

function getTier(itemName) {
  let item = items.find(i => i.name === itemName);
  return item ? item.tier : 0;
}

function show(id) { let el = document.getElementById(id); if (el) el.style.display = "block"; }
function hide(id) { let el = document.getElementById(id); if (el) el.style.display = "none"; }

// Tab switching (unused with 3-panel layout)
window.tabSwitch = function(id) {
  let children = document.querySelectorAll("#gameArea > *");
  children.forEach(child => {
    if (child.id === "tabBar") show(child.id);
    else if (child.id === id) show(child.id);
    else hide(child.id);
  });
  console.log("Switched to tab:", id);
};

window.setSlotTab = function(slotIndex, tabId) {
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
window.beginGame = function() {
  hide("begin");
  show("gameArea");
  show("tabBar");
  setSlotTab(1, "forest");
  setSlotTab(2, "inventory");
  setSlotTab(3, "explore");
  updateInventoryDisplay();
  refreshUnlocks();
  renderExplorationLog();
};

// Inventory display
function updateInventoryDisplay() {
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
    </ul>
  `;

  if (getTier("craftingTable") === 0 && stick >= 10 && stone >= 5) show("makeT1Crafting");
  else hide("makeT1Crafting");

  refreshContextButtons();
  refreshUnlocks();
}

function refreshContextButtons() {
  if (getTier("bucket") > 0) show("fillBucket"); else hide("fillBucket");
  if (getTier("shovel") > 0) show("mineDirt"); else hide("mineDirt");
  if (getTier("pickaxe") > 0) { show("mineStoneMetal"); show("rawMetalBtn"); }
  else { hide("mineStoneMetal"); hide("rawMetalBtn"); }
  if (getTier("spear") > 0) show("huntBtn"); else hide("huntBtn");
}

function refreshUnlocks() {
  setOptionEnabled("crafting", getTier("craftingTable") > 0);
  setOptionEnabled("cave", window.__caveDiscovered);
  setOptionEnabled("hunting", getTier("spear") > 0);
  setCraftingTierOptionEnabled(getTier("craftingTable") >= 2);
  if (getTier("craftingTable") >= 2) show("exploreMoreBtn"); else hide("exploreMoreBtn");
}

function setOptionEnabled(optionValue, enabled) {
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

function setCraftingTier(tier) {
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

window.exploreMore = function() {
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
    { name: "Scrap metal", key: "scrap", rarity: "common", weight: 40 },
    { name: "Old cloth", key: "cloth", rarity: "common", weight: 30 },
    { name: "Rusty gear", key: "gear", rarity: "uncommon", weight: 15 },
    { name: "Ancient wire", key: "wire", rarity: "rare", weight: 10 },
    { name: "Blueprint fragment", key: "blueprint", rarity: "epic", weight: 5 }
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
window.collectStick = function() {
  let tier = getTier("axe");
  stick += tier === 0 ? 1 : tier ** 10;
  updateInventoryDisplay();
};

window.collectStone = function() {
  let tier = getTier("pickaxe");
  stone += tier === 0 ? 1 : tier ** 10;
  updateInventoryDisplay();
};

// Explore
window.fillBucket = function() {
  let capacity = bucketCapacityByTier[getTier("bucket")];
  if (capacity > 0) { water = capacity; updateInventoryDisplay(); }
};

window.mineDirt = function() {
  if (getTier("shovel") > 0) { 
    dirt += getTier("shovel") * 3;
     updateInventoryDisplay(); 
     }
};

window.discoverCave = function() {
  window.__caveDiscovered = true;
  refreshUnlocks();
  hide("search");
};

// Cave
window.mineCave = function() {
  if (getTier("pickaxe") > 0) { stone += 3; rawMetal += 1; updateInventoryDisplay(); }
};

window.collectRawMetal = function() {
  if (getTier("pickaxe") > 0) { rawMetal++; updateInventoryDisplay(); }
};

// Hunting
window.huntMeat = function() {
  if (getTier("spear") > 0) { meat += getTier("spear") * 5; updateInventoryDisplay(); }
};

// Crafting
window.makeT1CraftingTable = function() {
  if (stick >= 10 && stone >= 5 && getTier("craftingTable") === 0) {
    stick -= 10; stone -= 5;
    updateItemTier("craftingTable", 1);
    show("craftingTab");
    hide("makeT1CraftingTable")
  }
};

window.makeKnife = function() {
  if (stick >= 10 && stone >= 15 && getTier("knife") === 0) {
    stick -= 10; stone -= 15;
    updateItemTier("knife", 1);
    hide("makeKnife")
  }
};

window.makeThatch = function() {
  if (getTier("knife") > 0 && stick >= 1) { stick--; thatch++; updateInventoryDisplay(); }
};

window.makeRope = function() {
  if (thatch >= 25) { thatch -= 25; crudeRope++; updateInventoryDisplay(); }
};

window.makePickaxe = function() {
  if (stick >= 20 && stone >= 25 && getTier("pickaxe") === 0) {
    stick -= 20; stone -= 25;
    updateItemTier("pickaxe", 1);
    hide("makePickaxe")
  }
};

window.makeShovel = function() {
  if (stick >= 15 && stone >= 10 && getTier("shovel") === 0) {
    stick -= 15; stone -= 10;
    updateItemTier("shovel", 1);
    hide("makeShovel")
  }
};

window.makeBucket = function() {
  if (stone >= 50 && getTier("bucket") === 0) {
    stone -= 50;
    updateItemTier("bucket", 1);
    hide("makeBucket")
  }
};

window.makeSpear = function() {
  if (stick >= 30 && stone >= 15 && getTier("spear") === 0) {
    stick -= 30; stone -= 15;
    updateItemTier("spear", 1);
    refreshUnlocks();
    hide("makeSpear")
  }
};

window.makeClay = function() {
  if (dirt >= 5 && water > 0) { dirt -= 5; water--; clay++; updateInventoryDisplay(); }
};

window.upgradeBucket = function() {
  if (rawMetal >= 20 && clay >= 10) {
    rawMetal -= 20; clay -= 10;
    updateItemTier("bucket", 2);
    updateInventoryDisplay();
    hide("upgradeBucket")
  }
};

window.makeT2CraftingTable = function() {
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

window.__caveDiscovered = false;
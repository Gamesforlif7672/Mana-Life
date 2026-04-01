// Resources
let stick = 0;
let stone = 0;
let log = 0;
let charcoal = 0;
let clayBrick = 0;
let copperIngot = 0;
let bronzeIngot = 0;
let thatch = 0;
let crudeRope = 0;
let meat = 0;
let dirt = 0;
let water = 0;
let clay = 0;
let rawMetal = 0;

// Items with tiers
let items = [
  { name: "craftingTable", tier: 0 },
  { name: "knife", tier: 0 },
  { name: "pickaxe", tier: 0 },
  { name: "bucket", tier: 0 },
  { name: "spear", tier: 0 },
  { name: "shovel", tier: 0 },
  { name: "axe", tier: 0 },
  { name: "bronzePickaxe", tier: 0 },
  { name: "bronzeAxe", tier: 0 }
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

// Tab switching
window.tabSwitch = function(id) {
  let children = document.querySelectorAll("#gameArea > *");
  children.forEach(child => {
    if (child.id === "tabBar") show(child.id);
    else if (child.id === id) show(child.id);
    else hide(child.id);
  });
  console.log("Switched to tab:", id);
};

// Begin game
window.beginGame = function() {
  hide("begin");
  show("gameArea");
  show("tabBar");
  tabSwitch("forest");
  updateInventoryDisplay();
  refreshUnlocks();
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
      ${log ? `<li>Logs: ${log}</li>` : ""}
      ${charcoal ? `<li>Charcoal: ${charcoal}</li>` : ""}
      ${clayBrick ? `<li>Clay Bricks: ${clayBrick}</li>` : ""}
      ${copperIngot ? `<li>Copper Ingots: ${copperIngot}</li>` : ""}
      ${bronzeIngot ? `<li>Bronze Ingots: ${bronzeIngot}</li>` : ""}
      ${thatch ? `<li>Thatch: ${thatch}</li>` : ""}
      ${crudeRope ? `<li>Crude Rope: ${crudeRope}</li>` : ""}
      ${meat ? `<li>Meat: ${meat}</li>` : ""}
      ${dirt ? `<li>Dirt: ${dirt}</li>` : ""}
      ${clay ? `<li>Clay: ${clay}</li>` : ""}
      ${rawMetal ? `<li>Raw Metal: ${rawMetal}</li>` : ""}
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
  if (window.__caveDiscovered) show("caveTab"); else hide("caveTab");
  if (getTier("spear") > 0) show("huntingTab"); else hide("huntingTab");
  if (getTier("craftingTable") >= 2) show("workshopTab"); else hide("workshopTab");
}

// Forest collection
window.collectStick = function() {
  let tier = getTier("axe");
  stick += tier === 0 ? 1 : tier ** 10;
  updateInventoryDisplay();
};

window.collectLog = function() {
  let tier = getTier("bronzeAxe") > 0 ? 2 : getTier("axe") > 0 ? 1 : 0;
  log += tier === 2 ? 3 : tier === 1 ? 2 : 1;
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
  if (getTier("bronzePickaxe") > 0) {
    stone += 5;
    rawMetal += 2;
    updateInventoryDisplay();
  } else if (getTier("pickaxe") > 0) {
    stone += 3;
    rawMetal += 1;
    updateInventoryDisplay();
  }
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

window.makeCharcoal = function() {
  if (stick >= 10) {
    stick -= 10;
    charcoal++;
    updateInventoryDisplay();
  }
};

window.makeClayBrick = function() {
  if (dirt >= 2 && water > 0) {
    dirt -= 2;
    water -= 1;
    clayBrick++;
    updateInventoryDisplay();
  }
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

window.smeltCopper = function() {
  if (rawMetal >= 2 && charcoal >= 1) {
    rawMetal -= 2;
    charcoal -= 1;
    copperIngot++;
    updateInventoryDisplay();
  }
};

window.makeBronze = function() {
  if (copperIngot >= 1 && rawMetal >= 1 && charcoal >= 1) {
    copperIngot -= 1;
    rawMetal -= 1;
    charcoal -= 1;
    bronzeIngot++;
    updateInventoryDisplay();
  }
};

window.makeBronzePickaxe = function() {
  if (bronzeIngot >= 1 && stick >= 10 && getTier("bronzePickaxe") === 0) {
    bronzeIngot -= 1;
    stick -= 10;
    updateItemTier("bronzePickaxe", 1);
    hide("makeBronzePickaxe");
  }
};

window.makeBronzeAxe = function() {
  if (bronzeIngot >= 1 && stick >= 10 && getTier("bronzeAxe") === 0) {
    bronzeIngot -= 1;
    stick -= 10;
    updateItemTier("bronzeAxe", 1);
    hide("makeBronzeAxe");
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
    show("craftingT2");
    tabSwitch("crafting");
    hide("makeT2Crafting")
  }
};

window.__caveDiscovered = false;
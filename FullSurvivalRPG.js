import React, { useState, useEffect } from "react";

export default function FullSurvivalRPG() {
  // Core Survival Stats
  const [wood, setWood] = useState(0);
  const [food, setFood] = useState(5);
  const [water, setWater] = useState(5);
  const [hunger, setHunger] = useState(100);
  const [thirst, setThirst] = useState(100);
  const [energy, setEnergy] = useState(100);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [shelter, setShelter] = useState(false);
  const [fire, setFire] = useState(false);

  // Time, Weather, and Temperature
  const [time, setTime] = useState(6);
  const [weather, setWeather] = useState("Clear");
  const [temperature, setTemperature] = useState(25);

  // Log and Tab Management
  const [log, setLog] = useState(["You wake up in an unknown land..."]);
  const [currentTab, setCurrentTab] = useState("map");

  // Village & Tycoon Mechanics
  const [villagers, setVillagers] = useState(0);
  const [buildings, setBuildings] = useState({ farm: 0, mine: 0, workshop: 0 });
  const [resourceProduction, setResourceProduction] = useState({ farm: 0, mine: 0 });
  const [inventory, setInventory] = useState([]);
  const inventoryLimit = 20;

  // Advanced Features: Research, Tech Tree, and Tasks
  const [researchPoints, setResearchPoints] = useState(0);
  const [techTree, setTechTree] = useState({
    stoneAge: { unlocked: false, cost: 10, reward: "Stone Tools" },
    metallurgy: { unlocked: false, cost: 20, reward: "Metal Tools" },
    steelWorking: { unlocked: false, cost: 30, reward: "Steel Weapons" },
    fortifications: { unlocked: false, cost: 25, reward: "Stronger Walls" },
    diplomacy: { unlocked: false, cost: 15, reward: "Trade Agreements" }
  });
  const [tasks, setTasks] = useState([
    { task: "Gather 10 wood", goal: 10, progress: 0, reward: 2 },
    { task: "Gather 5 food", goal: 5, progress: 0, reward: 1 }
  ]);

  // Skill Progression
  const [skills, setSkills] = useState({
    gathering: 0,
    crafting: 0,
    combat: 0,
    exploration: 0
  });

  // Encounter System (null if no active encounter)
  const [currentEncounter, setCurrentEncounter] = useState(null);

  // Helper function to add messages to the event log
  const addLog = (message) => {
    setLog((prev) => [message, ...prev.slice(0, 9)]);
  };

  // Helper to update specific skill values
  const updateSkill = (skill, amount) => {
    setSkills((prev) => ({ ...prev, [skill]: prev[skill] + amount }));
  };

  // Update task progress for a given task name
  const updateTaskProgress = (taskName, amount) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.task === taskName ? { ...task, progress: task.progress + amount } : task
      )
    );
  };

  // Time, resource decay, and health effects
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => (prev + 1) % 24);
      setHunger((prev) => Math.max(0, prev - 3));
      setThirst((prev) => Math.max(0, prev - 3));
      setEnergy((prev) => Math.max(0, prev - 2));

      // Health penalties if hunger or thirst are low
      if (hunger < 20) setPlayerHealth((prev) => Math.max(0, prev - 2));
      if (thirst < 20) setPlayerHealth((prev) => Math.max(0, prev - 2));
      // Cold damage if temperature is low and no fire is lit
      if (temperature < 10 && !fire) setPlayerHealth((prev) => Math.max(0, prev - 3));
    }, 5000);
    return () => clearInterval(interval);
  }, [hunger, thirst, temperature, fire]);

  // Update temperature based on weather and time of day
  useEffect(() => {
    const baseTemp =
      weather === "Clear" ? 25 : weather === "Rain" ? 20 : 15;
    const tempAdjustment = time >= 18 || time < 6 ? -10 : 0;
    setTemperature(baseTemp + tempAdjustment);
  }, [time, weather]);

  // Randomize weather every minute
  useEffect(() => {
    const weatherInterval = setInterval(() => {
      const options = ["Clear", "Rain", "Storm"];
      const newWeather = options[Math.floor(Math.random() * options.length)];
      setWeather(newWeather);
      addLog(`The weather changes to ${newWeather}.`);
    }, 60000);
    return () => clearInterval(weatherInterval);
  }, []);

  // Random events and encounters
  useEffect(() => {
    const eventInterval = setInterval(() => {
      // Only trigger an encounter if none is active
      if (!currentEncounter && Math.random() < 0.2) {
        const roll = Math.random();
        if (roll < 0.5) {
          setCurrentEncounter({ type: "raider", enemyHealth: 50 });
          addLog("Raiders have ambushed you!");
        } else if (roll < 0.8) {
          setCurrentEncounter({ type: "trader" });
          addLog("A trader has arrived in your village.");
        } else {
          setCurrentEncounter({ type: "wildAnimal", enemyHealth: 30 });
          addLog("A wild animal is prowling nearby!");
        }
      }
    }, 15000);
    return () => clearInterval(eventInterval);
  }, [currentEncounter]);

  // Core Actions

  const gatherWood = () => {
    const amount = 1 + Math.floor(skills.gathering / 10);
    setWood((prev) => prev + amount);
    addLog(`You gathered ${amount} wood.`);
    updateSkill("gathering", 1);
    updateTaskProgress("Gather 10 wood", 1);
  };

  const gatherFood = () => {
    const amount = 1;
    setFood((prev) => prev + amount);
    addLog(`You gathered ${amount} food.`);
    updateSkill("gathering", 1);
    updateTaskProgress("Gather 5 food", 1);
  };

  const gatherWater = () => {
    setWater((prev) => prev + 1);
    addLog("You gathered 1 water.");
    updateSkill("gathering", 1);
  };

  const eatFood = () => {
    if (food > 0) {
      setFood((prev) => prev - 1);
      setHunger((prev) => Math.min(100, prev + 20));
      addLog("You ate food and restored hunger.");
    } else {
      addLog("No food available!");
    }
  };

  const drinkWater = () => {
    if (water > 0) {
      setWater((prev) => prev - 1);
      setThirst((prev) => Math.min(100, prev + 20));
      addLog("You drank water and quenched your thirst.");
    } else {
      addLog("No water available!");
    }
  };

  const rest = () => {
    const bonus = shelter ? 10 : 0;
    setEnergy((prev) => Math.min(100, prev + 30 + bonus));
    addLog("You rested and regained energy.");
  };

  const buildShelter = () => {
    if (wood >= 10 && !shelter) {
      setWood((prev) => prev - 10);
      setShelter(true);
      addLog("You built a shelter.");
    } else {
      addLog("Not enough wood or shelter already built.");
    }
  };

  const startFire = () => {
    if (wood >= 3 && !fire) {
      setWood((prev) => prev - 3);
      setFire(true);
      addLog("You started a fire.");
    } else {
      addLog("Not enough wood or fire already burning.");
    }
  };

  const craftItem = (item) => {
    let cost = 0;
    if (item === "Basic Tool") cost = 2;
    else if (item === "Axe") cost = 4;
    else if (item === "Spear") cost = 4;
    else if (item === "Armor") cost = 6;
    if (wood >= cost) {
      setWood((prev) => prev - cost);
      if (inventory.length < inventoryLimit) {
        setInventory((prev) => [...prev, item]);
        addLog(`You crafted a ${item}.`);
        updateSkill("crafting", 1);
      } else {
        addLog("Inventory is full!");
      }
    } else {
      addLog("Not enough wood to craft.");
    }
  };

  const explore = () => {
    addLog("You venture into unknown lands.");
    updateSkill("exploration", 1);
    // Increase local production as a result of exploration
    setResourceProduction((prev) => ({ ...prev, farm: prev.farm + 1 }));
    // Chance to trigger an encounter if none is active
    if (!currentEncounter && Math.random() < 0.3) {
      const roll = Math.random();
      if (roll < 0.5) {
        setCurrentEncounter({ type: "raider", enemyHealth: 50 });
        addLog("Raiders ambush you during exploration!");
      } else if (roll < 0.8) {
        setCurrentEncounter({ type: "wildAnimal", enemyHealth: 30 });
        addLog("A wild animal attacks you!");
      } else {
        setCurrentEncounter({ type: "trader" });
        addLog("You meet a wandering trader.");
      }
    }
  };

  const recruitVillager = () => {
    if (food >= 3) {
      setFood((prev) => prev - 3);
      setVillagers((prev) => prev + 1);
      addLog("You recruited a new villager.");
      // Increase resource production with each new villager
      setResourceProduction((prev) => ({
        farm: prev.farm + 1,
        mine: prev.mine + 1
      }));
    } else {
      addLog("Not enough food to recruit a villager.");
    }
  };

  // Village Building Functions
  const buildFarm = () => {
    if (wood >= 5) {
      setWood((prev) => prev - 5);
      setBuildings((prev) => ({ ...prev, farm: prev.farm + 1 }));
      setResourceProduction((prev) => ({ ...prev, farm: prev.farm + 2 }));
      addLog("You built a farm.");
    } else {
      addLog("Not enough wood to build a farm.");
    }
  };

  const buildMine = () => {
    if (wood >= 5) {
      setWood((prev) => prev - 5);
      setBuildings((prev) => ({ ...prev, mine: prev.mine + 1 }));
      setResourceProduction((prev) => ({ ...prev, mine: prev.mine + 2 }));
      addLog("You built a mine.");
    } else {
      addLog("Not enough wood to build a mine.");
    }
  };

  const buildWorkshop = () => {
    if (wood >= 8) {
      setWood((prev) => prev - 8);
      setBuildings((prev) => ({ ...prev, workshop: prev.workshop + 1 }));
      addLog("You built a workshop, boosting crafting efficiency.");
    } else {
      addLog("Not enough wood to build a workshop.");
    }
  };

  // Combat Functions for Raider or Wild Animal encounters
  const attackEnemy = () => {
    if (currentEncounter && (currentEncounter.type === "raider" || currentEncounter.type === "wildAnimal")) {
      const damage = 5 + Math.floor(skills.combat / 10);
      const newEnemyHealth = currentEncounter.enemyHealth - damage;
      addLog(`You attack the ${currentEncounter.type} for ${damage} damage.`);
      updateSkill("combat", 2);
      if (newEnemyHealth <= 0) {
        addLog(`You defeated the ${currentEncounter.type}!`);
        setCurrentEncounter(null);
        earnResearchPoints(3);
      } else {
        setCurrentEncounter({ ...currentEncounter, enemyHealth: newEnemyHealth });
        enemyAttack();
      }
    }
  };

  const enemyAttack = () => {
    if (currentEncounter && (currentEncounter.type === "raider" || currentEncounter.type === "wildAnimal")) {
      const damage = 3 + Math.floor(Math.random() * 3);
      setPlayerHealth((prev) => Math.max(0, prev - damage));
      addLog(`The ${currentEncounter.type} attacks you for ${damage} damage.`);
    }
  };

  const defendEnemy = () => {
    addLog("You brace yourself and reduce the incoming damage.");
    if (currentEncounter && (currentEncounter.type === "raider" || currentEncounter.type === "wildAnimal")) {
      const damage = 1 + Math.floor(Math.random() * 2);
      setPlayerHealth((prev) => Math.max(0, prev - damage));
      addLog(`You only took ${damage} damage while defending.`);
    }
  };

  const fleeEncounter = () => {
    if (currentEncounter) {
      if (Math.random() < 0.5) {
        addLog("You successfully fled from the encounter.");
        setCurrentEncounter(null);
      } else {
        addLog("You failed to escape! The enemy attacks.");
        enemyAttack();
      }
    }
  };

  // Trade Functions for Trader encounters
  const tradeWoodForFood = () => {
    if (wood >= 2) {
      setWood((prev) => prev - 2);
      setFood((prev) => prev + 1);
      addLog("Traded 2 wood for 1 food.");
    } else {
      addLog("Not enough wood to trade.");
    }
  };

  const tradeFoodForTech = () => {
    if (food >= 2) {
      setFood((prev) => prev - 2);
      setResearchPoints((prev) => prev + 1);
      addLog("Traded 2 food for 1 research point.");
    } else {
      addLog("Not enough food to trade.");
    }
  };

  // Tech Tree Functions
  const earnResearchPoints = (points) => {
    setResearchPoints((prev) => prev + points);
    addLog(`You earned ${points} research points.`);
  };

  const unlockTechnology = (tech) => {
    if (researchPoints >= techTree[tech].cost && !techTree[tech].unlocked) {
      setResearchPoints((prev) => prev - techTree[tech].cost);
      setTechTree((prev) => ({
        ...prev,
        [tech]: { ...prev[tech], unlocked: true }
      }));
      addLog(`Technology ${tech} unlocked: ${techTree[tech].reward}.`);
    } else {
      addLog("Not enough research points or already unlocked.");
    }
  };

  const completeTask = (index) => {
    const updatedTasks = [...tasks];
    const task = updatedTasks[index];
    if (task.progress >= task.goal) {
      earnResearchPoints(task.reward);
      updatedTasks.splice(index, 1);
      setTasks(updatedTasks);
      addLog("Task completed!");
    } else {
      addLog("Task not yet completed!");
    }
  };

  return (
    <div className="p-10 bg-gray-900 text-white min-h-screen overflow-auto">
      <h1 className="text-4xl font-bold mb-4">Advanced Survival RPG</h1>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setCurrentTab("map")}
          className={`px-6 py-2 rounded text-lg ${currentTab === "map" ? "bg-blue-500" : "bg-gray-500"}`}
        >
          Map & Village
        </button>
        <button
          onClick={() => setCurrentTab("tech")}
          className={`px-6 py-2 rounded text-lg ${currentTab === "tech" ? "bg-green-500" : "bg-gray-500"}`}
        >
          Tech & Tasks
        </button>
      </div>
      {currentTab === "map" && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Survival Stats</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p>🌲 Wood: {wood}</p>
              <p>🍎 Food: {food}</p>
              <p>💧 Water: {water}</p>
              <p>🏠 Shelter: {shelter ? "Yes" : "No"}</p>
              <p>🔥 Fire: {fire ? "Burning" : "Not Lit"}</p>
            </div>
            <div>
              <p>🍽️ Hunger: {hunger}</p>
              <p>💦 Thirst: {thirst}</p>
              <p>⚡ Energy: {energy}</p>
              <p>❤️ Health: {playerHealth}</p>
              <p>⏰ Time: {time}:00 ({time >= 6 && time < 18 ? "Day" : "Night"})</p>
              <p>🌡️ Temp: {temperature}°C</p>
              <p>☁️ Weather: {weather}</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Village & Production</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p>🏘️ Villagers: {villagers}</p>
              <p>🏡 Buildings:</p>
              <ul>
                <li>Farm: {buildings.farm}</li>
                <li>Mine: {buildings.mine}</li>
                <li>Workshop: {buildings.workshop}</li>
              </ul>
              <p>🚜 Production:</p>
              <ul>
                <li>Farm: {resourceProduction.farm}</li>
                <li>Mine: {resourceProduction.mine}</li>
              </ul>
            </div>
            <div>
              <p>🔧 Skills:</p>
              <ul>
                <li>Gathering: {skills.gathering}</li>
                <li>Crafting: {skills.crafting}</li>
                <li>Combat: {skills.combat}</li>
                <li>Exploration: {skills.exploration}</li>
              </ul>
              <p>🎒 Inventory ({inventory.length}/{inventoryLimit}):</p>
              <ul>
                {inventory.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={gatherWood} className="bg-yellow-500 px-4 py-2 rounded">
              Gather Wood
            </button>
            <button onClick={gatherFood} className="bg-green-500 px-4 py-2 rounded">
              Gather Food
            </button>
            <button onClick={gatherWater} className="bg-blue-500 px-4 py-2 rounded">
              Gather Water
            </button>
            <button onClick={eatFood} className="bg-red-500 px-4 py-2 rounded">
              Eat Food
            </button>
            <button onClick={drinkWater} className="bg-blue-300 px-4 py-2 rounded">
              Drink Water
            </button>
            <button onClick={rest} className="bg-purple-500 px-4 py-2 rounded">
              Rest
            </button>
            <button onClick={buildShelter} className="bg-gray-700 px-4 py-2 rounded">
              Build Shelter
            </button>
            <button onClick={startFire} className="bg-orange-500 px-4 py-2 rounded">
              Start Fire
            </button>
            <button onClick={() => craftItem("Basic Tool")} className="bg-indigo-500 px-4 py-2 rounded">
              Craft Tool
            </button>
            <button onClick={() => craftItem("Axe")} className="bg-indigo-500 px-4 py-2 rounded">
              Craft Axe
            </button>
            <button onClick={() => craftItem("Spear")} className="bg-indigo-500 px-4 py-2 rounded">
              Craft Spear
            </button>
            <button onClick={() => craftItem("Armor")} className="bg-indigo-500 px-4 py-2 rounded">
              Craft Armor
            </button>
            <button onClick={explore} className="bg-teal-500 px-4 py-2 rounded">
              Explore
            </button>
            <button onClick={recruitVillager} className="bg-pink-500 px-4 py-2 rounded">
              Recruit Villager
            </button>
            <button onClick={buildFarm} className="bg-green-700 px-4 py-2 rounded">
              Build Farm
            </button>
            <button onClick={buildMine} className="bg-green-700 px-4 py-2 rounded">
              Build Mine
            </button>
            <button onClick={buildWorkshop} className="bg-green-700 px-4 py-2 rounded">
              Build Workshop
            </button>
          </div>
          {currentEncounter && (
            <div className="bg-red-800 p-4 rounded mb-4">
              <h2 className="text-xl font-bold">
                Encounter:{" "}
                {currentEncounter.type === "raider"
                  ? "Raider"
                  : currentEncounter.type === "trader"
                  ? "Trader"
                  : "Wild Animal"}
              </h2>
              {currentEncounter.type === "raider" || currentEncounter.type === "wildAnimal" ? (
                <div>
                  <p>Enemy Health: {currentEncounter.enemyHealth}</p>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={attackEnemy} className="bg-red-500 px-4 py-2 rounded">
                      Attack
                    </button>
                    <button onClick={defendEnemy} className="bg-yellow-500 px-4 py-2 rounded">
                      Defend
                    </button>
                    <button onClick={fleeEncounter} className="bg-gray-500 px-4 py-2 rounded">
                      Flee
                    </button>
                  </div>
                </div>
              ) : currentEncounter.type === "trader" ? (
                <div>
                  <p>Trade Options:</p>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={tradeWoodForFood} className="bg-blue-500 px-4 py-2 rounded">
                      Trade 2 Wood for 1 Food
                    </button>
                    <button onClick={tradeFoodForTech} className="bg-green-500 px-4 py-2 rounded">
                      Trade 2 Food for 1 RP
                    </button>
                    <button
                      onClick={() => {
                        setCurrentEncounter(null);
                        addLog("Ended trade with trader.");
                      }}
                      className="bg-gray-500 px-4 py-2 rounded"
                    >
                      End Trade
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
          <div className="bg-gray-800 p-4 rounded max-h-60 overflow-auto">
            <h2 className="text-xl font-bold">Event Log</h2>
            {log.map((entry, index) => (
              <p key={index}>{entry}</p>
            ))}
          </div>
        </div>
      )}
      {currentTab === "tech" && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Tech & Tasks</h2>
          <p className="mb-2">📚 Research Points: {researchPoints}</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {Object.entries(techTree).map(([tech, data]) => (
              <button
                key={tech}
                onClick={() => unlockTechnology(tech)}
                disabled={data.unlocked}
                className={`px-4 py-2 rounded ${data.unlocked ? "bg-green-500" : "bg-gray-500"}`}
              >
                {data.unlocked ? `✅ ${tech}` : `Unlock ${tech} (${data.cost} RP)`}
              </button>
            ))}
          </div>
          <h3 className="text-xl font-bold mb-2">Tasks</h3>
          {tasks.map((task, index) => (
            <div key={index} className="p-2 bg-gray-700 rounded mb-2">
              <p>
                {task.task}: {task.progress}/{task.goal}
              </p>
              <button onClick={() => completeTask(index)} className="bg-purple-500 px-4 py-1 rounded">
                Complete Task
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

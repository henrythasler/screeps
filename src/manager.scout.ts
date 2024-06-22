import { Config } from "./config";
import { EnergyLocation, Role, roleToString, Species, findMostExpensiveSpecies } from "./manager.global";
import { Task } from "./task";
import { Trait } from "./trait";

const bodyPartCosts: Map<BodyPartConstant, number> = new Map([
    [MOVE, 50],
    [WORK, 100],
    [CARRY, 50],
    [ATTACK, 80],
    [RANGED_ATTACK, 150],
    [HEAL, 250],
    [CLAIM, 600],
    [TOUGH, 10],
]);

const scoutZoo: Map<string, Species> = new Map([
    ["SCOUT_ENTRY", { 
        parts: [CLAIM, WORK, CARRY, MOVE, MOVE],
        traits: [
            // Trait.CHARGE_AWAY,
            // Trait.CHARGE_STORAGE,
            // Trait.CHARGE_SOURCE,
            Trait.CLAIM_CONTROLLER,
            Trait.RESERVE_CONTROLLER,
            Trait.SWITCH_ROOM,    
            Trait.RECON,
        ],
        cost: 800,
    }],
]);

export function run(): void {

    // create an array for all creeps to work with
    const scouts: Creep[] = [];
    for (const name in Game.creeps) {
        if (Game.creeps[name].memory.role == Role.SCOUT) {
            scouts.push(Game.creeps[name]);
        }
    }

    // create an array for all spawns
    const spawns: StructureSpawn[] = [];
    for (const name in Game.spawns) {
        spawns.push(Game.spawns[name]);
    }

    if ((Game.time % 60) == 0) {
        // clean up dead creeps every n ticks
        for (const name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    }

    const spawn = spawns[0];

    // check number of active creeps; spawn a new one if needed
    if (scouts.length < Config.scout.minCount && !spawn.spawning) {
        const newName = 'scout_' + spawn.room.name + "_" + Game.time;
        const species = findMostExpensiveSpecies(spawn.room.energyCapacityAvailable, scoutZoo);
        if (species) {
            spawn.spawnCreep(species.parts, newName,
                {
                    memory: {
                        speciesName: species.name,
                        role: Role.SCOUT,
                        task: Task.IDLE,
                        traits: species.traits,
                        occupation: [], //[Trait.CHARGE_SOURCE, Trait.CHARGE_STORAGE],
                        percentile: -1,
                        lastChargeSource: EnergyLocation.OTHER,
                        lastEnergyDeposit: EnergyLocation.OTHER,
                        homeBase: spawn.room.name,
                    },
                });
        }
    }

    // show some info about new creep
    if (spawn.spawning) {
        var spawningCreep = Game.creeps[spawn.spawning.name];
        // assign a unique number between 0..100
        spawningCreep.memory.percentile = Math.round(parseInt(spawningCreep.id.substring(22), 16) * 100 / 255);
        spawn.room.visual.text('🍼 ' + spawningCreep.memory.speciesName, spawn.pos.x + 1, spawn.pos.y, { align: 'left', opacity: 0.8 });
    }

    // apply trait distribution
    if ((Game.time % 30) == 0) {
        const numCreeps = scouts.length;
        const currentDistribution: Map<Trait, number> = new Map();

        let traitOverview = "";
        for (const creep of scouts) {
            // update traits from blueprint
            if (creep.memory.speciesName) {
                const species = scoutZoo.get(creep.memory.speciesName);
                if(species) {
                    creep.memory.traits = species.traits;
                }
            }

            // assign occupation
            creep.memory.occupation = [];
            for (const trait of Config.scout.availableTraits) {

                const current = currentDistribution.get(trait);
                const expected = Config.scout.traitDistribution.get(trait);

                if (numCreeps >= 10) {
                    if (creep.memory.traits.includes(trait) && expected && (creep.memory.percentile <= (expected * 100))) {
                        creep.memory.occupation.push(trait);
                    }
                }
                else {
                    if (current && expected) {
                        if (creep.memory.traits.includes(trait) && (current < Math.ceil(expected * numCreeps))) {
                            creep.memory.occupation.push(trait);
                            currentDistribution.set(trait, current + 1);
                        }
                    }
                    else if (creep.memory.traits.includes(trait)) {
                        creep.memory.occupation.push(trait);
                        currentDistribution.set(trait, 1);
                    }
                }
            }
            console.log(`[${creep.name}][${creep.memory.speciesName}] traits: [${creep.memory.traits}], occupation: [${creep.memory.occupation}]`)
        }
    }
}
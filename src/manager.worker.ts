import { Loglevel, log } from "./debug";
import { Config } from "./config";
import { EnergyLocation, Role, roleToString, Species, findMostExpensiveSpecies, applyTraitDistribution, managePopulation, manageTraitDistribution } from "./manager.global";
import { Task } from "./task";
import { Trait } from "./trait";

const workerZoo: Map<string, Species> = new Map([
    ["WORKER_ENTRY", {
        parts: [WORK, CARRY, MOVE],
        traits: [
            Trait.ACTION_LOCAL,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_CONTAINER,
            Trait.CHARGE_SOURCE,
            Trait.CHARGE_LINK,
            Trait.STORE_ENERGY,
            Trait.STORE_CONTAINER,
            Trait.STORE_STORAGE,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
            Trait.RENEW_CREEP,
        ],
        cost: 200,
    }],
    ["WORKER_ENTRY_SLOW", {
        parts: [WORK, CARRY, CARRY, CARRY, MOVE],
        traits: [
            Trait.ACTION_LOCAL,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_CONTAINER,
            Trait.CHARGE_SOURCE,
            Trait.CHARGE_LINK,
            Trait.STORE_ENERGY,
            Trait.STORE_CONTAINER,
            Trait.STORE_STORAGE,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
            Trait.RENEW_CREEP,
        ],
        cost: 300,
    }],
    ["WORKER_ENTRY_FAST", {
        parts: [WORK, CARRY, MOVE, MOVE],
        traits: [
            Trait.ACTION_LOCAL,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_CONTAINER,
            Trait.CHARGE_SOURCE,
            Trait.CHARGE_LINK,
            Trait.STORE_ENERGY,
            Trait.STORE_CONTAINER,
            Trait.STORE_STORAGE,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
            Trait.RENEW_CREEP,
        ],
        cost: 250,
    }],
    ["WORKER_ENTRY_HEAVY", {
        parts: [WORK, CARRY, CARRY, MOVE, MOVE],
        traits: [
            Trait.ACTION_LOCAL,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_CONTAINER,
            Trait.CHARGE_SOURCE,
            Trait.CHARGE_LINK,
            Trait.STORE_ENERGY,
            Trait.STORE_CONTAINER,
            Trait.STORE_STORAGE,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
            Trait.RENEW_CREEP,
        ],
        cost: 300,
    }],
    ["WORKER_BASIC", {
        parts: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        traits: [
            Trait.ACTION_LOCAL,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_CONTAINER,
            Trait.CHARGE_SOURCE,
            Trait.CHARGE_LINK,
            Trait.STORE_ENERGY,
            Trait.STORE_CONTAINER,
            Trait.STORE_STORAGE,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
            Trait.RENEW_CREEP,
        ],
        cost: 400,
    }],
    ["WORKER_BASIC_SLOW", {
        parts: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
        traits: [
            Trait.ACTION_LOCAL,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_CONTAINER,
            Trait.CHARGE_SOURCE,
            Trait.CHARGE_LINK,
            Trait.STORE_ENERGY,
            Trait.STORE_CONTAINER,
            Trait.STORE_STORAGE,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
            Trait.RENEW_CREEP,
        ],
        cost: 600,
    }],
    ["WORKER_BASIC_FAST", {
        parts: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        traits: [
            Trait.ACTION_LOCAL,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_CONTAINER,
            Trait.CHARGE_SOURCE,
            Trait.CHARGE_LINK,
            Trait.STORE_ENERGY,
            Trait.STORE_CONTAINER,
            Trait.STORE_STORAGE,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
            Trait.RENEW_CREEP,
        ],
        cost: 700,
    }],
    ["WORKER_INTERMEDIATE", {
        parts: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        traits: [
            Trait.ACTION_LOCAL,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_CONTAINER,
            Trait.CHARGE_SOURCE,
            Trait.CHARGE_LINK,
            Trait.STORE_ENERGY,
            Trait.STORE_CONTAINER,
            Trait.STORE_STORAGE,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
            Trait.RENEW_CREEP,
        ],
        cost: 1200,
    }],

    // ["WORKER_BASIC_HEAVY", {
    //     parts: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    //     traits: [
    //         Trait.CHARGE_LOCAL,
    //         // Trait.CHARGE_STORAGE,
    //         Trait.CHARGE_SOURCE,
    //         Trait.STORE_ENERGY,
    //         Trait.REPAIR_STRUCTURE,
    //         Trait.RECHARGE_STRUCTURE,
    //         Trait.RECHARGE_CONTROLLER,
    //         Trait.BUILD_STRUCTURE,
    //         Trait.REFRESH_CONTROLLER,
    //     ],
    //     cost: 900,
    // }],     
]);

export function run(room: Room): void {
    if ((Game.time % 10) == 0) {
        const creeps: Creep[] = room.find(FIND_MY_CREEPS, {
            filter: (creep) => {
                return creep.memory.role == Role.WORKER;
            }
        });

        log(`[${room.name}] worker: ${creeps.length}/${Config.worker.minCount}`, Loglevel.INFO);

        managePopulation(Config.worker.minCount, creeps.length, room, workerZoo, Role.WORKER);
        manageTraitDistribution(creeps, workerZoo, Config.worker.traitDistribution);
    }    
/*
    // create an array for all creeps to work with
    const worker: Creep[] = [];
    for (const name in Game.creeps) {
        if (Game.creeps[name].memory.role == Role.WORKER && !Game.creeps[name].spawning) {
            worker.push(Game.creeps[name]);
        }
    }

    // create an array for all spawns
    const spawns: StructureSpawn[] = [];
    for (const name in Game.spawns) {
        spawns.push(Game.spawns[name]);
    }

    const spawn = spawns[0];

    // check number of active creeps; spawn a new one if needed
    if ((worker.length < Config.worker.minCount) && !spawn.spawning) {
        const species = findMostExpensiveSpecies(spawn.room.energyCapacityAvailable, Memory.ticksWithoutSpawn, workerZoo);
        if (species) {
            spawn.memory.buildQueue.push({species: species, role: Role.WORKER});
        }
    }

    // apply trait distribution
    if ((Game.time % 30) == 0) {
        const numCreeps = worker.length;
        const currentDistribution: Map<Trait, number> = new Map();
        for (const creep of worker) {
            // update traits from blueprint
            if (creep.memory.speciesName) {
                const species = workerZoo.get(creep.memory.speciesName);
                if (species) {
                    creep.memory.traits = species.traits;
                }
            }

            // assign occupation
            creep.memory.occupation = [];
            for (const trait of Config.worker.availableTraits) {

                const current = currentDistribution.get(trait);
                const expected = Config.worker.traitDistribution.get(trait);

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
                    else if (creep.memory.traits.includes(trait) && expected && expected > 0) {
                        creep.memory.occupation.push(trait);
                        currentDistribution.set(trait, 1);
                    }
                }
            }
            console.log(`[${creep.name}][${creep.memory.speciesName}] traits: [${creep.memory.traits}], occupation: [${creep.memory.occupation}]`)
        }
    }
    */
}
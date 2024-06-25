import { Config } from "./config";
import { EnergyLocation, Role, roleToString, Species, findMostExpensiveSpecies } from "./manager.global";
import { Task } from "./task";
import { Trait } from "./trait";

const workerZoo: Map<string, Species> = new Map([
    ["WORKER_ENTRY", {
        parts: [WORK, CARRY, MOVE],
        traits: [
            Trait.CHARGE_LOCAL,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_SOURCE,
            Trait.STORE_ENERGY,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
        ],
        cost: 200,
    }],
    ["WORKER_ENTRY_SLOW", {
        parts: [WORK, CARRY, CARRY, CARRY, MOVE],
        traits: [
            Trait.CHARGE_LOCAL,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_SOURCE,
            Trait.STORE_ENERGY,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
        ],
        cost: 300,
    }],
    ["WORKER_ENTRY_FAST", {
        parts: [WORK, CARRY, MOVE, MOVE],
        traits: [
            Trait.CHARGE_LOCAL,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_SOURCE,
            Trait.STORE_ENERGY,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
        ],
        cost: 250,
    }],
    ["WORKER_ENTRY_HEAVY", {
        parts: [WORK, CARRY, CARRY, MOVE, MOVE],
        traits: [
            Trait.CHARGE_LOCAL,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_SOURCE,
            Trait.STORE_ENERGY,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
        ],
        cost: 300,
    }],
    ["WORKER_BASIC", {
        parts: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        traits: [
            Trait.CHARGE_LOCAL,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_SOURCE,
            Trait.STORE_ENERGY,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
        ],
        cost: 400,
    }],
    ["WORKER_BASIC_SLOW", {
        parts: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
        traits: [
            Trait.CHARGE_LOCAL,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_SOURCE,
            Trait.STORE_ENERGY,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
        ],
        cost: 600,
    }],
    ["WORKER_BASIC_FAST", {
        parts: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        traits: [
            Trait.CHARGE_LOCAL,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_SOURCE,
            Trait.STORE_ENERGY,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
        ],
        cost: 700,
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

export function run(): number {

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
    if ((worker.length < Config.worker.minCount) && !spawn.spawning) {
        const newName = 'worker_' + spawn.room.name + "_" + Game.time;
        const species = findMostExpensiveSpecies(spawn.room.energyCapacityAvailable, Memory.ticksWithoutSpawn, workerZoo);
        if (species) {
            const res = spawn.spawnCreep(species.parts, newName,
                {
                    memory: {
                        speciesName: species.name,
                        role: Role.WORKER,
                        task: Task.IDLE,
                        traits: species.traits,
                        occupation: [Trait.CHARGE_SOURCE, Trait.CHARGE_STORAGE],
                        percentile: -1,
                        lastChargeSource: EnergyLocation.OTHER,
                        lastEnergyDeposit: EnergyLocation.OTHER,
                        homeBase: spawn.room.name,
                    },
                });
            if (res != OK) {
                console.log(`[ERROR] spawnCreep(${species.parts}) returned ${res}`);
                if (Memory.ticksWithoutSpawn == undefined) {
                    Memory.ticksWithoutSpawn = 0;
                }
                Memory.ticksWithoutSpawn++;
            }
            else {
                Memory.ticksWithoutSpawn = 0;
            }
        }
    }
    else {
        Memory.ticksWithoutSpawn = 0;

        const needRepair: Creep[] = [];
        for (const name in Game.creeps) {
            const creep = Game.creeps[name];
            if (!creep.spawning && spawn.pos.getRangeTo(creep.pos) <= 1 && creep.ticksToLive! < 1000) {
                needRepair.push(creep);
            }
        }
        if (needRepair.length > 0) {
            spawn.renewCreep(needRepair[0]);
        }
    }

    // show some info about new creep
    if (spawn.spawning) {
        var spawningCreep = Game.creeps[spawn.spawning.name];
        // assign a unique number between 0..100
        spawningCreep.memory.percentile = Math.round(parseInt(spawningCreep.id.substring(22), 16) * 100 / 255);
        spawningCreep.memory.task = Task.IDLE;
        spawn.room.visual.text('🍼 ' + spawningCreep.memory.speciesName, spawn.pos.x + 1, spawn.pos.y, { align: 'left', opacity: 0.8 });
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
                    else if (creep.memory.traits.includes(trait)) {
                        creep.memory.occupation.push(trait);
                        currentDistribution.set(trait, 1);
                    }
                }
            }
            console.log(`[${creep.name}][${creep.memory.speciesName}] traits: [${creep.memory.traits}], occupation: [${creep.memory.occupation}]`)
        }
    }
    return worker.length;
}
import { Trait } from "./trait";
import { Config } from "./config";
import { EnergyLocation, Role, roleToString, Species, SpeciesName, findMostExpensiveCreep } from "./manager.global";
import { Task } from "./task";

const workerZoo: Map<SpeciesName, Species> = new Map([
    [SpeciesName.WORKER_ENTRY, {
        parts: [WORK, CARRY, MOVE],
        traits: [
            Trait.CHARGE_LOCAL, 
            Trait.CHARGE_SOURCE, 
            Trait.CHARGE_STORAGE, 
            Trait.BUILD_STRUCTURE, 
            Trait.RECHARGE_STRUCTURE,
        ],
        cost: 200,
    }],
    [SpeciesName.WORKER_ENTRY_SLOW, { 
        parts: [WORK, CARRY, CARRY, CARRY, MOVE],
        cost: 300,
     }],
    [SpeciesName.WORKER_ENTRY_FAST, { parts: [WORK, CARRY, MOVE, MOVE], cost: 250 }],
    [SpeciesName.WORKER_ENTRY_HEAVY, { parts: [WORK, CARRY, CARRY, MOVE, MOVE], cost: 300 }],
    [SpeciesName.WORKER_BASIC, { parts: [WORK, WORK, CARRY, CARRY, MOVE, MOVE], cost: 400 }],
    [SpeciesName.WORKER_BASIC_SLOW, { parts: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], cost: 600 }],
    [SpeciesName.WORKER_BASIC_FAST, { parts: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], cost: 700 }],
    // [SpeciesName.WORKER_BASIC_HEAVY, { parts: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], cost: 700 }],
]);

export function run(minWorker: number) {

    // create an array for all creeps to work with
    const creeps: Creep[] = [];
    for (const name in Game.creeps) {
        creeps.push(Game.creeps[name]);
    }

    // create an array for all spawns
    const spawns: StructureSpawn[] = [];
    for (const name in Game.spawns) {
        spawns.push(Game.spawns[name]);
    }

    if ((Game.time % 60) == 0) {
        // clean up dead creeps every n ticks
        for (var name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    }

    // check number of active creeps; spawn a new one if needed
    var numWorker = creeps.filter((creep: Creep) => creep.memory.role == Role.WORKER).length;
    if (numWorker < minWorker) {
        var newName = 'worker_' + Game.time;
        const species = findMostExpensiveCreep(spawns[0].room.energyCapacityAvailable, workerZoo);
        if (species) {
            spawns[0].spawnCreep(workerZoo.get(species)!.parts, newName,
                {
                    memory: {
                        role: Role.WORKER,
                        task: Task.IDLE,
                        traits: [Task.IDLE, Task.CHARGE, Task.MOVETO, Task.CHARGE_STRUCTURE, Task.BUILD_STRUCTURE],
                        percentile: -1,
                        lastChargeSource: EnergyLocation.OTHER,
                        lastEnergyDeposit: EnergyLocation.OTHER,
                        homeBase: "",
                    },
                });
        }
    }

    // show some info about new creep
    if (spawns[0].spawning) {
        var spawningCreep = Game.creeps[spawns[0].spawning.name];
        // assign a unique number between 0..100
        spawningCreep.memory.percentile = Math.round(parseInt(spawningCreep.id.substring(22), 16) * 100 / 255);
        spawns[0].room.visual.text(
            '🛠️ ' + roleToString(spawningCreep.memory.role),
            spawns[0].pos.x + 1,
            spawns[0].pos.y,
            { align: 'left', opacity: 0.8 });
    }

    // apply trait distribution
    if ((Game.time % 30) == 0) {
        const numCreeps = creeps.length;
        const currentDistribution: Map<Task, number> = new Map();

        let traitOverview = "";
        for (const creep of creeps) {
            creep.memory.traits = [];
            for (const trait of Config.worker.availableTraits) {

                const current = currentDistribution.get(trait);
                const expected = Config.worker.traitDistribution.get(trait);

                if (numCreeps >= 10) {
                    if (expected && (creep.memory.percentile <= (expected * 100))) {
                        creep.memory.traits.push(trait);
                    }
                }
                else {
                    if (current && expected) {
                        if (current < Math.ceil(expected * numCreeps)) {
                            creep.memory.traits.push(trait);
                            currentDistribution.set(trait, current + 1);
                        }
                    }
                    else {
                        creep.memory.traits.push(trait);
                        currentDistribution.set(trait, 1);
                    }
                }
            }
            traitOverview += `${creep.memory.traits.length}, `;
        }
        console.log(`Traits: [${traitOverview}]`);
    }
}
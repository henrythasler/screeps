import { Config } from "./config";
import { EnergyLocation, Role, roleToString, Species, SpeciesName, findMostExpensiveCreep } from "./manager.global";
import { Task } from "./task";

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

const scoutZoo: Map<SpeciesName, Species> = new Map([
    [SpeciesName.SCOUT_ENTRY, { parts: [/*CLAIM, */WORK, CARRY, MOVE, MOVE], cost: 200 }],
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
        for (var name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    }

    // check number of active creeps; spawn a new one if needed
    if (scouts.length < Config.scout.minCountPerRoom) {
        const spawn = spawns[0];
        var newName = 'scout_' + Game.time;
        const species = findMostExpensiveCreep(spawn.room.energyCapacityAvailable, scoutZoo);
        if (species) {
            spawn.spawnCreep(scoutZoo.get(species)!.parts, newName,
                {
                    memory: {
                        role: Role.SCOUT,
                        task: Task.IDLE,
                        traits: [Task.IDLE, Task.CHARGE, Task.CLAIM_CONTROLLER, Task.RESERVE_CONTROLLER],
                        percentile: -1,
                        lastChargeSource: EnergyLocation.OTHER,
                        lastEnergyDeposit: EnergyLocation.OTHER,
                        homeBase: spawn.room.name,
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
        const numCreeps = scouts.length;
        const currentDistribution: Map<Task, number> = new Map();

        let traitOverview = "";
        for (const creep of scouts) {
            creep.memory.traits = [];
            for (const trait of Config.scout.availableTraits) {

                const current = currentDistribution.get(trait);
                const expected = Config.scout.traitDistribution.get(trait);

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
        console.log(`Scout Traits: [${traitOverview}]`);
    }
}
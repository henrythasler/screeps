import { Loglevel, log } from "./debug";
import { Config } from "./config";
import { EnergyLocation, Role, Species, applyTraitDistribution, findMostExpensiveSpecies, managePopulation, manageTraitDistribution } from "./manager.global";
import { Task } from "./task";
import { Trait } from "./trait";

const collectorZoo: Map<string, Species> = new Map([
    // ["COLLECTOR_TEST", {
    //     parts: [WORK, CARRY, MOVE, MOVE],
    //     traits: [
    //         Trait.CHARGE_AWAY,
    //         Trait.CHARGE_SOURCE,
    //         Trait.STORE_ENERGY,
    //         Trait.SWITCH_ROOM,
    //     ],
    //     cost: 250,
    // }],
    ["COLLECTOR_BASIC", {
        parts: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        traits: [
            Trait.ACTION_AWAY,
            Trait.CHARGE_SOURCE,
            Trait.STORE_ENERGY,
            Trait.STORE_CONTAINER,
            Trait.STORE_STORAGE,
            Trait.SWITCH_ROOM,
            Trait.RENEW_CREEP,
        ],
        cost: 750,
    }],
    ["COLLECTOR_INTERMEDIATE", {
        parts: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        traits: [
            Trait.ACTION_AWAY,
            Trait.CHARGE_SOURCE,
            Trait.BUILD_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
            Trait.STORE_ENERGY,
            Trait.STORE_CONTAINER,
            Trait.STORE_STORAGE,
            Trait.STORE_LINK,
            Trait.SWITCH_ROOM,
            Trait.RENEW_CREEP,
        ],
        cost: 1200,
    }],    
]);

export function run(room: Room): void {
    // apply trait distribution
    if ((Game.time % 10) == 0) {
        // these creeps can be anywhere, so we just filter by their homebase
        const creeps: Creep[] = [];
        for (const name in Game.creeps) {
            if (Game.creeps[name].memory.role == Role.COLLECTOR && Game.creeps[name].memory.homeBase == room.name) {
                creeps.push(Game.creeps[name]);
            }
        }

        log(`[${room.name}] collector: ${creeps.length}/${Config.collector.minCount}`, Loglevel.INFO);

        managePopulation(Config.collector.minCount, creeps.length, room, collectorZoo, Role.COLLECTOR);
        manageTraitDistribution(creeps, collectorZoo, Config.collector.traitDistribution);
    }

    /*
        // create an array for all creeps to work with
        const collector: Creep[] = [];
        for (const name in Game.creeps) {
            if (Game.creeps[name].memory.role == Role.COLLECTOR) {
                collector.push(Game.creeps[name]);
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
        if ((collector.length < Config.collector.minCount) && !spawn.spawning) {
            const newName = 'collector_' + spawn.room.name + "_" + Game.time;
            const species = findMostExpensiveSpecies(spawn.room.energyCapacityAvailable, Memory.ticksWithoutSpawn, collectorZoo);
            if (species) {
                const res = spawn.spawnCreep(species.parts, newName,
                    {
                        memory: {
                            speciesName: species.name,
                            role: Role.COLLECTOR,
                            task: Task.IDLE,
                            traits: species.traits,
                            occupation: [],
                            percentile: -1,
                            lastChargeSource: EnergyLocation.OTHER,
                            lastEnergyDeposit: EnergyLocation.OTHER,
                            homeBase: spawn.room.name,
                        },
                    });
                if (res != OK) {
                    console.log(`[ERROR] spawnCreep(${species.parts}) returned ${res}`);
                }
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
            const numCreeps = collector.length;
            const currentDistribution: Map<Trait, number> = new Map();
            for (const creep of collector) {
                // update traits from blueprint
                if (creep.memory.speciesName) {
                    const species = collectorZoo.get(creep.memory.speciesName);
                    if (species) {
                        creep.memory.traits = species.traits;
                    }
                }
    
                // assign occupation
                creep.memory.occupation = [];
                for (const trait of Config.collector.availableTraits) {
    
                    const current = currentDistribution.get(trait);
                    const expected = Config.collector.traitDistribution.get(trait);
    
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
        return collector.length;
    */
}
import { Config } from "./config";
import { Loglevel, log } from "./debug";
import { EnergyLocation, Role, roleToString, Species, findMostExpensiveSpecies } from "./manager.global";
import { Task } from "./task";
import { Trait } from "./trait";

export interface RequiredSpecies {
    species: Species,
    role: Role,
}

function generateName(role: Role, room: Room): string {
    if (role == Role.WORKER) return `worker_${room.name}_${Game.time}`;
    if (role == Role.COLLECTOR) return `collector_${room.name}_${Game.time}`;
    if (role == Role.SCOUT) return `scout_${room.name}_${Game.time}`;
    if (role == Role.HARVESTER) return `harvester_${room.name}_${Game.time}`;
    return `unknown_${room}_${Game.time}`;
}

export function run(room: Room): void {
    const availableSpawns = room.find(FIND_MY_SPAWNS);

    if (!availableSpawns.length) {
        log(`[${room.name}] no spawn available`, Loglevel.INFO);
        return;
    }

    // FIXME: iterate over available spawns
    const spawn = availableSpawns[0];

    if (room.memory.buildQueue.length && !spawn.spawning) {
        log(`[${room.name}][spawn] buildQueue: ${room.memory.buildQueue.length}`, Loglevel.INFO);
        // FIXME: sort build queue
        const requiredCreep = room.memory.buildQueue[0];

        log(`[${room.name}][spawn] spawning ${requiredCreep.species.name} (role: ${requiredCreep.role})`, Loglevel.INFO);
        const res = spawn.spawnCreep(requiredCreep.species.parts, generateName(requiredCreep.role, room),
            {   
                dryRun: Config.spawnDryRun,
                directions: [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT],
                memory: {
                    speciesName: requiredCreep.species.name ?? "undefined",
                    role: requiredCreep.role,
                    task: Task.IDLE,
                    traits: requiredCreep.species.traits,
                    occupation: [],
                    percentile: -1,
                    lastChargeSource: EnergyLocation.OTHER,
                    lastEnergyDeposit: EnergyLocation.OTHER,
                    homeBase: room.name,
                },
            });
        if (res == OK) {
            room.memory.ticksWithPendingSpawns = 0;
        }
        else {
            // console.log(`[ERROR][${room.name}][spawn] spawnCreep(${requiredCreep.species.parts}) returned ${res}`);
            room.memory.ticksWithPendingSpawns = room.memory.ticksWithPendingSpawns ? room.memory.ticksWithPendingSpawns + 1 : 0;
        }
    }
    else {
        room.memory.ticksWithPendingSpawns = 0;

        const renew: Creep[] = room.find(FIND_MY_CREEPS, {
            filter: (creep) => {
                return !creep.spawning && spawn.pos.getRangeTo(creep.pos) <= 1 && creep.ticksToLive! < Config.creepRenewMax && creep.memory.task == Task.RENEW;
            }
        });

        if (renew.length > 0) {
            renew.sort((a: Creep, b: Creep): number => {
                return (a.ticksToLive! - b.ticksToLive!);
            });
            spawn.renewCreep(renew[0]);
        }
    }

    availableSpawns.forEach((spawn) => {
        // show some info about new creep
        if (spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name];
            // assign a unique number between 0..100
            spawningCreep.memory.percentile = Math.round(parseInt(spawningCreep.id.substring(22), 16) * 100 / 255);
            room.visual.text('🍼 ' + spawningCreep.memory.speciesName, spawn.pos.x + 1, spawn.pos.y, { align: 'left', opacity: 0.7 });
        }
    });
    /*    
        for (const name in Game.spawns) {
            const spawn = Game.spawns[name];
    
            if (spawn.memory.buildQueue.length > 0) {
                // FIXME: sort queue
                const toSpawn = spawn.memory.buildQueue[0];
                const res = spawn.spawnCreep(toSpawn.species.parts, generateName(toSpawn.role, spawn.room),
                    {
                        memory: {
                            speciesName: toSpawn.species.name,
                            role: toSpawn.role,
                            task: Task.IDLE,
                            traits: toSpawn.species.traits,
                            occupation: [Trait.CHARGE_SOURCE, Trait.CHARGE_STORAGE],
                            percentile: -1,
                            lastChargeSource: EnergyLocation.OTHER,
                            lastEnergyDeposit: EnergyLocation.OTHER,
                            homeBase: spawn.room.name,
                        },
                    });
                if (res != OK) {
                    console.log(`[ERROR] spawnCreep(${toSpawn.species.parts}) returned ${res}`);
                    if (Memory.ticksWithoutSpawn == undefined) {
                        Memory.ticksWithoutSpawn = 0;
                    }
                    Memory.ticksWithoutSpawn++;
                }
                else {
                    Memory.ticksWithoutSpawn = 0;
                }
            }
            else {
                Memory.ticksWithoutSpawn = 0;
    
                const needRepair: Creep[] = [];
                for (const name in Game.creeps) {
                    if (Game.creeps[name].memory.role == Role.WORKER && !Game.creeps[name].spawning &&
                        spawn.pos.getRangeTo(Game.creeps[name].pos) <= 1) {
                        needRepair.push(Game.creeps[name]);
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
                spawn.room.visual.text('🍼 ' + spawningCreep.memory.speciesName, spawn.pos.x + 1, spawn.pos.y, { align: 'left', opacity: 0.8 });
            }
        }
    */
}
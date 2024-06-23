import { Config } from "./config";
import { EnergyLocation, Role, roleToString, Species, findMostExpensiveSpecies } from "./manager.global";
import { Task } from "./task";
import { Trait } from "./trait";

export interface RequiredSpecies {
    species: Species,
    role: Role,
}

function generateName(role: Role, room: Room): string {
    if(role == Role.WORKER) return `worker_${room.name}_${Game.time}`;
    if(role == Role.COLLECTOR) return `collector_${room.name}_${Game.time}`;
    if(role == Role.SCOUT) return `scout_${room.name}_${Game.time}`;
    return `unknown_${room}_${Game.time}`;
}

export function resetBuildQueue(): void {
    for (const name in Game.spawns) {
        Game.spawns[name].memory.buildQueue = [];
    }
}

export function run(): void {
    for (const name in Game.spawns) {
        const spawn = Game.spawns[name];

        if(spawn.memory.buildQueue.length > 0) {
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
    }
}
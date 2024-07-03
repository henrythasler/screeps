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
        log(`[${room.name}] no spawn available`, Loglevel.DEBUG);
        return;
    }

    availableSpawns.forEach((spawn) => {
        const renew: Creep[] = room.find(FIND_MY_CREEPS, {
            filter: (creep) => {
                return !creep.spawning && spawn.pos.getRangeTo(creep.pos) <= 1 && creep.ticksToLive! < Config.creepRenewMax && creep.memory.task == Task.RENEW;
            }
        });

        if (renew.length > 0) {
            renew.sort((a: Creep, b: Creep): number => {
                return (a.ticksToLive! - b.ticksToLive!);
            });
            spawn.renewCreep(renew[0]!);
        }

        if (room.memory.buildQueue.length && !spawn.spawning) {
            log(`[${room.name}][spawn] buildQueue: [${room.memory.buildQueue.reduce( (str, val) => str+=roleToString(val.role) + " ", "")}], ticksWithPendingSpawns:${room.memory.ticksWithPendingSpawns}`, Loglevel.INFO);
            const requiredCreep = room.memory.buildQueue[0]!;

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
                        alerts: [],
                        targetLocation: null,
                    },
                });
            if (res == OK) {
                log(`[${room.name}][spawn] spawning ${requiredCreep.species.name} (role: ${requiredCreep.role})`, Loglevel.INFO);
                room.memory.buildQueue.shift();
                room.memory.ticksWithPendingSpawns = 0;
            }
            else {
                // console.log(`[ERROR][${room.name}][spawn] spawnCreep(${requiredCreep.species.parts}) returned ${res}`);
                room.memory.ticksWithPendingSpawns += 1;

                // remove item prom the queue after a while
                if(room.memory.ticksWithPendingSpawns > 60) {
                    room.memory.buildQueue.shift();
                }
            }
        }

        // show some info about new creep
        if (spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name]!;
            // assign a unique number between 0..100
            spawningCreep.memory.percentile = Math.round(parseInt(spawningCreep.id.substring(22), 16) * 100 / 255);
            room.visual.text('🍼 ' + spawningCreep.memory.speciesName, spawn.pos.x + 1, spawn.pos.y, { align: 'left', opacity: 0.7 });
        }
    });
}
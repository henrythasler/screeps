import { Config } from "./config";
import { EnergyLocation, RequesterIdTypes, Role, Species, findMostExpensiveSpecies, initializeCreepObjects, managePopulation } from "./manager.global";
import { Task } from "./task";
import { Trait } from "./trait";
import * as worker from "./role.worker";
import * as scout from "./role.scout";
import * as collector from "./role.collector";
import * as harvester from "./role.harvester";
import * as defender from "./role.defender";
import * as hunter from "./role.hunter";
import { log, Loglevel } from "./debug";
import { priorityQueue } from "./priorityqueue";
import { zoo } from "./zoo";
import { getAdjacentHostileRooms } from "./helper";

// order defines priority
const runnables: Map<Role, Function> = new Map([
    [Role.DEFENDER, defender.run],
    [Role.HARVESTER, harvester.run],
    [Role.WORKER, worker.run],
    [Role.SCOUT, scout.run],
    [Role.COLLECTOR, collector.run],
    [Role.HUNTER, hunter.run],
]);

export function manageCreeps(room: Room): void {
    runnables.forEach((_, role) => {

        const creeps: Creep[] = [];
        for (const name in Game.creeps) {
            if (Game.creeps[name]!.memory.role == role && Game.creeps[name]!.memory.homeBase == room.name) {
                creeps.push(Game.creeps[name]!);
            }
        }

        let minCount = Config.creeps.get(role)?.minCount.get(room.name) ?? 0;

        if (role == Role.DEFENDER) {
            // add more defender the higher the threat-level is
            minCount += Math.floor(room.memory.threatLevel / Config.threatLevelDefenderThreshold) * Config.additionalDefender;
        }

        // only spawn if there is a threat nearby
        if (role == Role.HUNTER) {
            // log(`[${room.name}] ${getAdjacentHostileRooms(room).join(", ")}`);
            minCount = getAdjacentHostileRooms(room).length ? (Config.creeps.get(role)?.minCount.get(room.name) ?? 0) : 0;
        }

        room.memory.creepCensus.set(role, { current: creeps.length, required: minCount });

        const speciesZoo = zoo.get(role);
        if (speciesZoo) {
            managePopulation(minCount, creeps.length, room, speciesZoo, role);
        }

    });
}

export function run(room: Room): void {
    const creeps: Creep[] = room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
            return !creep.spawning;
        }
    });

    creeps.forEach((creep) => {
        const runnable = runnables.get(creep.memory.role);
        if (runnable) {
            initializeCreepObjects(creep);
            runnable(creep);
        }
        else {
            log(`[ERROR] No runnable for ${creep.memory.role}`, Loglevel.ERROR);
        }
    });
}

export function updateRequisitions(room: Room): void {
    const pendingRequester: Id<RequesterIdTypes>[] = Memory.pendingRequisitions.map(obj => obj.requesterId);

    const structuresToCharge: AnyOwnedStructure[] = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION ||
                structure.structureType == STRUCTURE_SPAWN ||
                structure.structureType == STRUCTURE_TOWER) &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && !pendingRequester.includes(structure.id);
        }
    });

    structuresToCharge.forEach((structure: AnyOwnedStructure) => {
        if (structure.structureType == STRUCTURE_EXTENSION) {
            Memory.pendingRequisitions.push({
                amount: structure.store.getFreeCapacity(RESOURCE_ENERGY),
                resource: RESOURCE_ENERGY,
                position: structure.pos,
                priority: 200,
                requesterId: structure.id,
            });
        }
        else if (structure.structureType == STRUCTURE_SPAWN) {
            Memory.pendingRequisitions.push({
                amount: structure.store.getFreeCapacity(RESOURCE_ENERGY),
                resource: RESOURCE_ENERGY,
                position: structure.pos,
                priority: 200,
                requesterId: structure.id,
            });
        }
        else if (structure.structureType == STRUCTURE_TOWER) {
            Memory.pendingRequisitions.push({
                amount: structure.store.getFreeCapacity(RESOURCE_ENERGY),
                resource: RESOURCE_ENERGY,
                position: structure.pos,
                priority: 150,
                requesterId: structure.id,
            });
        }
    });
}

export function cleanUpRequisitions(room: Room): void {
    const creeps: Creep[] = room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
            return !creep.spawning;
        }
    });

    // Memory.requisitionOwner = [];
    // Memory.pendingRequisitions = [];
    let remove = 0;

    if (creeps.length && Memory.pendingRequisitions.length) {
        Memory.pendingRequisitions = Memory.pendingRequisitions.filter((requisition) => {
            return requisition.amount > 0 || creeps.some((creep) => {
                if (creep.memory.activeRequisitions.length) {
                    return creep.memory.activeRequisitions.some((activeRequisition) => {
                        if (requisition.requesterId == activeRequisition.requesterId) return true;
                        return false;
                    })
                }
                else {
                    return false;
                }
            });
        });
    }
    // log(`cleanUpRequisitions(): ${Memory.pendingRequisitions.length} pendingRequisitions`)
    // else {
    //     Memory.requisitionOwner = [];
    // }
}
import { Config } from "./config";
import { EnergyLocation, RequesterIdTypes, Role, Species, findMostExpensiveSpecies, initializeCreepObjects } from "./manager.global";
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
import { logRoomInfoMap } from "./room.info";

const runnables: Map<Role, Function> = new Map([
    [Role.WORKER, worker.run],
    [Role.SCOUT, scout.run],
    [Role.COLLECTOR, collector.run],
    [Role.HARVESTER, harvester.run],
    [Role.DEFENDER, defender.run],
    [Role.HUNTER, hunter.run],
]);

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
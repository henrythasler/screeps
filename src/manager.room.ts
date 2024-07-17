import { Config } from "./config";
import { EnergyLocation, Role, Species, findMostExpensiveSpecies, initializeCreepObjects } from "./manager.global";
import { Task } from "./task";
import { Trait } from "./trait";
import * as worker from "./role.worker";
import * as scout from "./role.scout";
import * as collector from "./role.collector";
import * as harvester from "./role.harvester";
import * as defender from "./role.defender";
import { log, Loglevel } from "./debug";
import { priorityQueue } from "./priorityqueue";

const runnables: Map<Role, Function> = new Map([
    [Role.WORKER, worker.run],
    [Role.SCOUT, scout.run],
    [Role.COLLECTOR, collector.run],
    [Role.HARVESTER, harvester.run],
    [Role.DEFENDER, defender.run],
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
    const structuresToCharge: AnyOwnedStructure[] = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION ||
                structure.structureType == STRUCTURE_SPAWN ||
                structure.structureType == STRUCTURE_TOWER) &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && !Memory.requisitionOwner.includes(structure.id);
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
            Memory.requisitionOwner.push(structure.id);
        }
        else if (structure.structureType == STRUCTURE_SPAWN) {
            Memory.pendingRequisitions.push({
                amount: structure.store.getFreeCapacity(RESOURCE_ENERGY),
                resource: RESOURCE_ENERGY,
                position: structure.pos,
                priority: 200,
                requesterId: structure.id,
            });
            Memory.requisitionOwner.push(structure.id);
        }
        else if (structure.structureType == STRUCTURE_TOWER) {
            Memory.pendingRequisitions.push({
                amount: structure.store.getFreeCapacity(RESOURCE_ENERGY),
                resource: RESOURCE_ENERGY,
                position: structure.pos,
                priority: 150,
                requesterId: structure.id,
            });
            Memory.requisitionOwner.push(structure.id);
        }
    });
}

export function cleanUpRequisitions(room: Room): void {
    const creeps: Creep[] = room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
            return !creep.spawning;
        }
    });

    if (creeps.length && Memory.requisitionOwner && Memory.requisitionOwner.length) {
        Memory.requisitionOwner = Memory.requisitionOwner.filter((requester) => {
            return creeps.some((creep) => {
                if (creep.memory.activeRequisitions.length) {
                    return creep.memory.activeRequisitions.some((requisition) => {
                        if (requester == requisition.requesterId) return true;
                        return false;
                    })
                }
                else {
                    return false;
                }
            });
        });
    }
    else {
        Memory.requisitionOwner = [];
    }
}
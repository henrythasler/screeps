import { nonInterruptableTasks } from "./trait.global";
import { Task } from "./types";

export function check(creep: Creep): Task {
    const structuresToCharge = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION ||
                structure.structureType == STRUCTURE_SPAWN ||
                structure.structureType == STRUCTURE_TOWER) &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    });
    if ((structuresToCharge.length > 0) && (nonInterruptableTasks.indexOf(creep.memory.task) < 0)) {
        return Task.CHARGE_STRUCTURE;
    }
    return creep.memory.task;
}

export function execute(creep: Creep): Task {
    if (creep.memory.task == Task.CHARGE_STRUCTURE) {
        const structuresToCharge = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (
                    structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });
        if (structuresToCharge.length > 0) {
            if (creep.transfer(structuresToCharge[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(structuresToCharge[0], { visualizePathStyle: { stroke: '#00ff00' } });
            }
        }
    }
    return creep.memory.task;
}
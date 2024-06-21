import { nonInterruptableTasks } from "./trait.global";
import { Task } from "./manager.global";

export function check(creep: Creep): Task {
    if (creep.memory.traits.includes(Task.CHARGE_STRUCTURE)) {
        const structuresToCharge: AnyStructure[] = creep.room.find(FIND_STRUCTURES, {
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
    }
    return creep.memory.task;
}

export function execute(creep: Creep): Task {
    if (creep.memory.task == Task.CHARGE_STRUCTURE) {
        const structuresToCharge: AnyStructure[] = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (
                    structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });
        if (structuresToCharge.length > 0) {
            // FIXME: add priority for charging structures
            structuresToCharge.sort((a: AnyStructure, b: AnyStructure): number => {
                return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
            });            
            if (creep.transfer(structuresToCharge[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(structuresToCharge[0], { visualizePathStyle: { stroke: '#00ff00' } });
            }
        }
    }
    return creep.memory.task;
}
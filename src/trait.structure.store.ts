import { nonInterruptableTasks } from "./trait.global";
import { Task } from "./types";

const structureTypes: StructureConstant[] = [STRUCTURE_CONTAINER];

export function check(creep: Creep): Task {
    const stores = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structureTypes.includes(structure.structureType) &&
                ((structure as StructureContainer).store.getFreeCapacity(RESOURCE_ENERGY) > 0));
        }
    });
    if ((stores.length > 0) && (nonInterruptableTasks.indexOf(creep.memory.task) < 0)) {
        return Task.STORE_ENERGY;
    }
    return creep.memory.task;
}

export function execute(creep: Creep): Task {
    if (creep.memory.task == Task.STORE_ENERGY) {
        const stores = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structureTypes.includes(structure.structureType) &&
                    ((structure as StructureContainer).store.getFreeCapacity(RESOURCE_ENERGY) > 0));
            }
        }) as StructureContainer[];
        if (stores.length > 0) {
            // sort by distance
            stores.sort((a: StructureContainer, b: StructureContainer): number => {
                return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
            });

            if (creep.transfer(stores[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(stores[0], { visualizePathStyle: { stroke: '#ffffff' } });
            }
        }
    }
    return creep.memory.task;
}
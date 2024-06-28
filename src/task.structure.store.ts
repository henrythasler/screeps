import { Task, nonInterruptableTasks } from "./task";
import { EnergyLocation } from "./manager.global";
import { Trait } from "./trait";

// const structureTypes: StructureConstant[] = [STRUCTURE_CONTAINER, STRUCTURE_STORAGE];

// export function check(creep: Creep): Task {
//     if ((creep.memory.lastChargeSource != EnergyLocation.CONTAINER) && creep.memory.occupation.includes(Trait.STORE_ENERGY) &&
//         (creep.store.getFreeCapacity() == 0)) {
//         const stores = creep.room.find(FIND_STRUCTURES, {
//             filter: (structure) => {
//                 return (structureTypes.includes(structure.structureType) &&
//                     ((structure as StructureContainer).store.getFreeCapacity(RESOURCE_ENERGY) > 0));
//             }
//         });
//         if ((stores.length > 0) && (nonInterruptableTasks.indexOf(creep.memory.task) < 0)) {
//             return Task.STORE_ENERGY;
//         }
//     }
//     return creep.memory.task;
// }

export function execute(creep: Creep): boolean {
    if (creep.memory.occupation.includes(Trait.STORE_ENERGY) &&
        // creep.memory.lastChargeSource != EnergyLocation.CONTAINER &&
        creep.store.getFreeCapacity() == 0) {
        creep.memory.task = Task.STORE_ENERGY;

        const container = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_CONTAINER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        }) as StructureContainer[];

        if (container.length && creep.memory.occupation.includes(Trait.STORE_CONTAINER)) {
            // sort by distance
            container.sort((a: StructureContainer, b: StructureContainer): number => {
                return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
            });

            if (creep.transfer(container[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(container[0], { visualizePathStyle: { stroke: '#ffffff' } });
            }
            else {
                creep.memory.lastEnergyDeposit = EnergyLocation.CONTAINER;
            }
            return true;
        }

        const storage = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_STORAGE && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        }) as StructureContainer[];

        if (storage.length && creep.memory.occupation.includes(Trait.STORE_STORAGE)) {
            // sort by distance
            storage.sort((a: StructureContainer, b: StructureContainer): number => {
                return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
            });

            if (creep.transfer(storage[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage[0], { visualizePathStyle: { stroke: '#ffffff' } });
            }
            else {
                creep.memory.lastEnergyDeposit = EnergyLocation.STORAGE;
            }
            return true;
        }
    }
    return false;
}
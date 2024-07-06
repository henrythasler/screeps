import { Task } from "./task";
import { EnergyLocation } from "./manager.global";
import { Trait } from "./trait";
import { actionAllowed } from "./helper";

export function execute(creep: Creep, maxDistance?: number): boolean {
    if (creep.memory.occupation.includes(Trait.STORE_ENERGY) &&
        // creep.memory.lastChargeSource != EnergyLocation.CONTAINER &&
        creep.store.getFreeCapacity() == 0) {
        creep.memory.task = Task.STORE_ENERGY;

        const links = creep.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_LINK && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                    creep.pos.getRangeTo(structure) < (maxDistance ?? 100);
            }
        }) as StructureLink[];

        if (links.length && creep.memory.occupation.includes(Trait.STORE_LINK)) {
            // sort by distance
            links.sort((a: StructureLink, b: StructureLink): number => {
                return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
            });

            if (creep.transfer(links[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(links[0], { visualizePathStyle: { stroke: '#ffffff' } });
            }
            else {
                creep.memory.lastEnergyDeposit = EnergyLocation.LINK;
            }
            return true;
        }        

        const container = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_CONTAINER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                    creep.pos.getRangeTo(structure) < (maxDistance ?? 100);
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
                return structure.structureType == STRUCTURE_STORAGE && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                    creep.pos.getRangeTo(structure) < (maxDistance ?? 100);
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

import { Task } from "./task";
import { EnergyLocation } from "./manager.global";
import { Trait } from "./trait";
import { isInHomeBase, mergeArrays, removeEntries } from "./helper";
import { categorizeCreepLocation, Location } from "./location";
import { zoo } from "./zoo";
import { Config } from "./config";

export function execute(creep: Creep, maxDistance?: number, ignoreLastDeposit: boolean = false): boolean {
    const species = zoo.get(creep.memory.role)?.get(creep.memory.speciesName);
    if (species) {
        const location = categorizeCreepLocation(creep.room, creep.memory.homeBase);

        // derive available traits for the current room and general traits
        const traits = removeEntries(mergeArrays(species.traits.get(location), species.traits.get(Location.EVERYWHERE)), species.traits.get(Location.NOWHERE));

        if (!traits.includes(Trait.STORE_ENERGY) || creep.store.getFreeCapacity() > 0) {
            return false;
        }

        if (traits.includes(Trait.STORE_LINK) &&
            ((creep.memory.lastChargeSource != EnergyLocation.LINK && creep.memory.lastChargeSource != EnergyLocation.CONTAINER && creep.memory.lastChargeSource != EnergyLocation.STORAGE) ||
                ignoreLastDeposit)) {
            const links = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_LINK && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                        creep.pos.getRangeTo(structure) < (maxDistance ?? 100);
                }
            }) as StructureLink[];

            if (links.length) {
                // sort by distance
                links.sort((a: StructureLink, b: StructureLink): number => {
                    return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
                });

                if (creep.transfer(links[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(links[0], { visualizePathStyle: Config.visualizePathStyle.get(Task.STORE_ENERGY) });
                }
                else {
                    creep.memory.lastEnergyDeposit = EnergyLocation.LINK;
                }
                creep.memory.task = Task.STORE_ENERGY;
                return true;
            }
        }

        if (traits.includes(Trait.STORE_CONTAINER) &&
            ((creep.memory.lastChargeSource != EnergyLocation.CONTAINER && creep.memory.lastChargeSource != EnergyLocation.STORAGE) ||
                ignoreLastDeposit)) {
            const container = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                        creep.pos.getRangeTo(structure) < (maxDistance ?? 100);
                }
            }) as StructureContainer[];
            if (container.length) {
                // sort by distance
                container.sort((a: StructureContainer, b: StructureContainer): number => {
                    return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
                });

                if (creep.transfer(container[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container[0], { visualizePathStyle: Config.visualizePathStyle.get(Task.STORE_ENERGY) });
                }
                else {
                    creep.memory.lastEnergyDeposit = EnergyLocation.CONTAINER;
                }
                return true;
            }
        }

        if (traits.includes(Trait.STORE_STORAGE) && (creep.memory.lastChargeSource != EnergyLocation.STORAGE || ignoreLastDeposit)) {
            const storage = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_STORAGE && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                        creep.pos.getRangeTo(structure) < (maxDistance ?? 100);
                }
            }) as StructureStorage[];
            if (storage.length) {
                // sort by distance
                storage.sort((a: StructureStorage, b: StructureStorage): number => {
                    return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
                });

                if (creep.transfer(storage[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage[0], { visualizePathStyle: Config.visualizePathStyle.get(Task.STORE_ENERGY) });
                }
                else {
                    creep.memory.lastEnergyDeposit = EnergyLocation.STORAGE;
                }
                return true;
            }
        }
    }
    return false;

    /*    
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
    
            if (container.length && creep.memory.occupation.includes(Trait.STORE_CONTAINER) && creep.store[RESOURCE_ENERGY] > 0) {
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
    
            // may always store at home
            if (storage.length && (creep.memory.occupation.includes(Trait.STORE_STORAGE) || creep.room.name == creep.memory.homeBase)) {
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
    */
    // return false;
}

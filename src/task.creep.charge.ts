import { Task, idleTasks } from "./task";
import { EnergyLocation, Role } from "./manager.global";
import { Trait } from "./trait";
import { Config } from "./config";
import { log, Loglevel } from "./debug";
import { isNearHostile, mergeArrays, removeEntries } from "./helper";
import { categorizeCreepLocation, Location } from "./location";
import { zoo } from "./zoo";

const containerTypes: StructureConstant[] = [STRUCTURE_CONTAINER, STRUCTURE_STORAGE, STRUCTURE_LINK];
const chargeTraits: Trait[] = [Trait.CHARGE_SOURCE, Trait.CHARGE_CONTAINER, Trait.CHARGE_STORAGE, Trait.CHARGE_LINK];

// all types share the 'pos' property, so we can have that mixed type
type energySource = (Tombstone | Ruin | StructureContainer | StructureStorage)[];

function withdrawEnergy(creep: Creep, source: energySource, sortByDistance: boolean, lastChargeSource: EnergyLocation): boolean {
    source.sort((a, b): number => {
        return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
    });
    // get stuff or move towards source
    // typeof(source) == "Resource"
    const res = creep.withdraw(source[0], RESOURCE_ENERGY);
    if (res == ERR_NOT_IN_RANGE) {
        creep.moveTo(source[0], { visualizePathStyle: Config.visualizePathStyle.get(Task.CHARGE) });
    }
    else if (res == OK) {
        creep.memory.lastChargeSource = lastChargeSource;
    }
    else {
        log(`[${creep.room.name}][${creep.name}] withdraw(${source[0]}) failed: ${res}`, Loglevel.ERROR);
        return false;
    }
    return true;
}

// function pickupItem(creep: Creep, item: Resource[], sortByDistance: boolean, lastChargeSource: EnergyLocation): Task {
//     item.sort((a, b): number => {
//         return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
//     });
//     // get stuff or move towards source
//     // typeof(source) == "Resource"
//     const res = creep.pickup(item[0]);
//     if (res == ERR_NOT_IN_RANGE) {
//         creep.moveTo(item[0], { visualizePathStyle: { stroke: '#ffaa00' } });
//     }
//     else if (res == OK) {
//         creep.memory.lastChargeSource = lastChargeSource;
//     }
//     else {
//         log(`[${creep.room.name}][${creep.name}] pickup(${item[0]}) failed: ${res}`, Loglevel.ERROR);
//     }
//     return creep.memory.task;
// }

// export function check(creep: Creep): Task {
//     if (creep.memory.occupation.some((trait: Trait) => chargeTraits.includes(trait)) && !nonInterruptableTasks.includes(creep.memory.task)) {
//         if ((creep.store[RESOURCE_ENERGY] == 0) || (idleTasks.includes(creep.memory.task) && (creep.store.getFreeCapacity() > 0))) {
//             if ((creep.memory.occupation.includes(Trait.CHARGE_LOCAL) && (creep.room.name == creep.memory.homeBase)) ||
//                 creep.memory.occupation.includes(Trait.CHARGE_AWAY) && (creep.room.name != creep.memory.homeBase) ||
//                 (creep.memory.homeBase == "")) {
//                 return Task.CHARGE;
//             }
//         }
//     }
//     return creep.memory.task;
// }

function check(creep: Creep, traits: Trait[]): boolean {
    // if (!actionAllowed(creep, creep.room.name)) {
    //     return false;
    // }

    if (!traits.some((trait: Trait) => chargeTraits.includes(trait))) {
        return false;
    }

    // // do not interrupt charging
    if (creep.memory.task == Task.CHARGE && creep.store.getFreeCapacity() > 0) {
        return true;
    }

    if (creep.store[RESOURCE_ENERGY] == 0 || (idleTasks.includes(creep.memory.task) && creep.store.getFreeCapacity() > 0)) {
        return true;
    }

    // if (creep.store[RESOURCE_ENERGY] == 0 || (idleTasks.includes(creep.memory.task) && creep.store.getFreeCapacity() > 0) ||
    //     (creep.room.name != creep.memory.homeBase && creep.store.getFreeCapacity() > 0 && creep.memory.task != Task.BUILD_STRUCTURE)) {
    //     return true;
    // }
    return false;
}

export function execute(creep: Creep): boolean {
    const species = zoo.get(creep.memory.role)?.get(creep.memory.speciesName);
    if (species) {
        const location = categorizeCreepLocation(creep);

        // derive available traits for the current room and general traits
        const traits = removeEntries(mergeArrays(species.traits.get(location), species.traits.get(Location.EVERYWHERE)), species.traits.get(Location.NOWHERE));

        if (!check(creep, traits)) {
            return false;
        }

        const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);

        // link
        if (creep.memory.lastEnergyDeposit != EnergyLocation.LINK && traits.includes(Trait.CHARGE_LINK)) {
            const container = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return !isNearHostile(structure, hostiles) && structure.structureType == STRUCTURE_LINK &&
                        structure.store[RESOURCE_ENERGY] > 0 && structure.pos.getRangeTo(creep.pos) < Config.linkChargeMaxDistance;
                }
            }) as StructureContainer[];

            if (container.length > 0 && withdrawEnergy(creep, container, true, EnergyLocation.LINK)) {
                creep.memory.task = Task.CHARGE;
                return true;
            }
        }

        // container
        if (creep.memory.lastEnergyDeposit != EnergyLocation.CONTAINER && traits.includes(Trait.CHARGE_CONTAINER)) {
            const container = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return !isNearHostile(structure, hostiles) && structure.structureType == STRUCTURE_CONTAINER &&
                        structure.store[RESOURCE_ENERGY] > 0;
                }
            }) as StructureContainer[];

            if (container.length > 0 && withdrawEnergy(creep, container, true, EnergyLocation.CONTAINER)) {
                creep.memory.task = Task.CHARGE;
                return true;
            }
        }

        // storage
        if (creep.memory.lastEnergyDeposit != EnergyLocation.STORAGE && traits.includes(Trait.CHARGE_STORAGE)) {
            const storage = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return !isNearHostile(structure, hostiles) && structure.structureType == STRUCTURE_STORAGE &&
                        structure.store[RESOURCE_ENERGY] > 0;
                }
            }) as StructureStorage[];

            if (storage.length > 0 && withdrawEnergy(creep, storage, true, EnergyLocation.STORAGE)) {
                creep.memory.task = Task.CHARGE;
                return true;
            }
        }
    }
    return false;
    /*    
        // if (creep.memory.task == Task.CHARGE) {
        if (check(creep)) {
            creep.memory.task = Task.CHARGE;
    
            // FIXME: remove occupied sources where no path leads to within 1 tile of the source
            // sources.filter( (source) => {
            //     return (source.pos.findInRange(FIND_CREEPS, 1).length < 3); 
            // });
    
            // sort by distance
            // sources.sort((a: Source, b: Source): number => {
            //     return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
            // });
    
            const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
    
            // Tombstones with energy
            const tombstones: Tombstone[] = creep.room.find(FIND_TOMBSTONES, {
                filter: (structure) => {
                    return !isNearHostile(structure, hostiles) && structure.store[RESOURCE_ENERGY] > 0 && structure.pos.getRangeTo(creep.pos) < (structure.store[RESOURCE_ENERGY] * Config.tombstoneGatherFactor);
                }
            });
            if (tombstones.length) {
                withdrawEnergy(creep, tombstones, true, EnergyLocation.OTHER);
                return true;
            }
    
            // dropped energy resources
            const resource: Resource[] = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: (resource) => {
                    return !isNearHostile(resource, hostiles) && resource.amount > 10 && resource.pos.getRangeTo(creep.pos) < Config.resourcePickupMaxDistance;
                }
            });
            if (resource.length) {
                pickupItem(creep, resource, true, EnergyLocation.OTHER);
                return true;
            }
    
            // Ruins with energy
            const ruins: Ruin[] = creep.room.find(FIND_RUINS, {
                filter: (structure) => {
                    return !isNearHostile(structure, hostiles) && structure.store[RESOURCE_ENERGY] > 0 && structure.pos.getRangeTo(creep.pos) < Config.ruinMaxDistance;
                }
            });
            if (ruins.length) {
                withdrawEnergy(creep, ruins, true, EnergyLocation.OTHER);
                return true;
            }
    
            // link
            if (creep.memory.lastEnergyDeposit != EnergyLocation.LINK && creep.memory.occupation.includes(Trait.CHARGE_LINK)) {
                const container = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return !isNearHostile(structure, hostiles) && structure.structureType == STRUCTURE_LINK &&
                            structure.store[RESOURCE_ENERGY] > 0 && structure.pos.getRangeTo(creep.pos) < Config.linkChargeMaxDistance;
                    }
                }) as StructureContainer[];
    
                if (container.length > 0) {
                    withdrawEnergy(creep, container, true, EnergyLocation.LINK);
                    return true;
                }
            }
    
            // container
            if (creep.memory.lastEnergyDeposit != EnergyLocation.CONTAINER && creep.memory.occupation.includes(Trait.CHARGE_CONTAINER)) {
                const container = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return !isNearHostile(structure, hostiles) && structure.structureType == STRUCTURE_CONTAINER &&
                            structure.store[RESOURCE_ENERGY] > 0;
                    }
                }) as StructureContainer[];
    
                if (container.length > 0) {
                    withdrawEnergy(creep, container, true, EnergyLocation.CONTAINER);
                    return true;
                }
            }
    
            // storage
            if (creep.memory.lastEnergyDeposit != EnergyLocation.STORAGE && creep.memory.occupation.includes(Trait.CHARGE_STORAGE)) {
                const storage = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return !isNearHostile(structure, hostiles) && structure.structureType == STRUCTURE_STORAGE &&
                            structure.store[RESOURCE_ENERGY] > 0;
                    }
                }) as StructureStorage[];
    
                if (storage.length > 0) {
                    withdrawEnergy(creep, storage, true, EnergyLocation.STORAGE);
                    return true;
                }
            }
    
            const sources: Source[] = creep.room.find(FIND_SOURCES, {
                filter: (source) => {
                    return !isNearHostile(source, hostiles) && !creep.room.controller?.reservation && (source.energy > 0 || source.ticksToRegeneration < 60);
                }
            }) as Source[];
            if (sources.length && creep.memory.occupation.includes(Trait.CHARGE_SOURCE)) {
                let sourceId = 0;
                // randomly select a source; static per creep
                if (creep.memory.homeBase == creep.room.name && creep.room.find(FIND_MY_CREEPS).length > 2) {
                    sourceId = creep.memory.percentile % sources.length;
                }
                else {
                    // sort by distance if in another room
                    sources.sort((a: Source, b: Source): number => {
                        return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
                    });
                }
    
                const source = sources[sourceId];
                // harvest or move towards source
                const res = creep.harvest(source);
                if (res == OK) {
                    creep.memory.lastChargeSource = EnergyLocation.SOURCE;
                }
                else if (res == ERR_NOT_IN_RANGE || res == ERR_NOT_ENOUGH_RESOURCES) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                else {
                    console.log(`[ERROR] harvest(${source}): ${res}`)
                    return false;
                }
                return true;
            }
            else {
                return false;
            }
        }
    */
    return false;
}
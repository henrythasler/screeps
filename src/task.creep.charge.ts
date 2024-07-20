import { Task, idleTasks } from "./task";
import { EnergyLocation, Role } from "./manager.global";
import { Trait } from "./trait";
import { Config } from "./config";
import { log, Loglevel } from "./debug";
import { isNearHostile, mergeArrays, removeEntries } from "./helper";
import { categorizeCreepLocation, Location } from "./location";
import { zoo } from "./zoo";

const containerTypes: StructureConstant[] = [STRUCTURE_CONTAINER, STRUCTURE_STORAGE, STRUCTURE_LINK];
const chargeTraits: Trait[] = [Trait.CHARGE_CONTAINER, Trait.CHARGE_STORAGE, Trait.CHARGE_LINK];

// all types share the 'pos' property, so we can have that mixed type
type energySource = (Tombstone | Ruin | StructureContainer | StructureStorage)[];

function withdrawEnergy(creep: Creep, sources: (StructureContainer | StructureStorage)[], sortByDistance: boolean, energyLocation: EnergyLocation): boolean {
    sources.sort((a, b): number => {
        return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
    });
    // get stuff or move towards source
    const source = sources[0];
    if (source) {
        const res = creep.withdraw(source, RESOURCE_ENERGY);
        if (res == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { visualizePathStyle: Config.visualizePathStyle.get(Task.CHARGE) });
        }
        else if (res == OK) {
            creep.memory.lastChargeSource = energyLocation;
        }
        else {
            log(`[${creep.room.name}][${creep.name}] withdraw(${sources[0]}) failed: ${res}`, Loglevel.ERROR);
            return false;
        }
        return true;
    }
    return false;
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
        const location = categorizeCreepLocation(creep.room, creep.memory.homeBase);

        // derive available traits for the current room and general traits
        const traits = removeEntries(mergeArrays(species.traits.get(location), species.traits.get(Location.EVERYWHERE)), species.traits.get(Location.NOWHERE));

        if (!check(creep, traits)) {
            return false;
        }

        const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);

        // link
        if (creep.memory.lastEnergyDeposit != EnergyLocation.LINK && 
            traits.includes(Trait.CHARGE_LINK)) {
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
        if (creep.memory.lastEnergyDeposit != EnergyLocation.CONTAINER && 
            creep.memory.lastEnergyDeposit != EnergyLocation.LINK && 
            traits.includes(Trait.CHARGE_CONTAINER)) {
            const container = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return !isNearHostile(structure, hostiles) &&
                        structure.structureType == STRUCTURE_CONTAINER &&
                        structure.store[RESOURCE_ENERGY] > 0;
                }
            }) as StructureContainer[];

            if (container.length > 0 && withdrawEnergy(creep, container, true, EnergyLocation.CONTAINER)) {
                creep.memory.task = Task.CHARGE;
                return true;
            }
        }

        // storage
        if (creep.memory.lastEnergyDeposit != EnergyLocation.STORAGE && 
            creep.memory.lastEnergyDeposit != EnergyLocation.CONTAINER &&            
            creep.memory.lastEnergyDeposit != EnergyLocation.LINK && 
            traits.includes(Trait.CHARGE_STORAGE)) {
            const container = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return !isNearHostile(structure, hostiles) &&
                        structure.structureType == STRUCTURE_STORAGE &&
                        structure.store[RESOURCE_ENERGY] > 0;
                }
            }) as StructureStorage[];

            if (container.length > 0 && withdrawEnergy(creep, container, true, EnergyLocation.STORAGE)) {
                creep.memory.task = Task.CHARGE;
                return true;
            }
        }
    }
    return false;
}
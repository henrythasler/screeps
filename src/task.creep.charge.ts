import { Task, nonInterruptableTasks, idleTasks } from "./task";
import { EnergyLocation } from "./manager.global";
import { Trait } from "./trait";
import { Config } from "./config";
import { Loglevel, log } from "./debug";
import { isNearHostile } from "./helper";

const containerTypes: StructureConstant[] = [STRUCTURE_CONTAINER, STRUCTURE_STORAGE];
const chargeTraits: Trait[] = [Trait.CHARGE_SOURCE, Trait.CHARGE_STORAGE];

// all types share the 'pos' property, so we can have that mixed type
type energySource = (Tombstone | Ruin | StructureContainer)[];

function withdrawEnergy(creep: Creep, source: energySource, sortByDistance: boolean, lastChargeSource: EnergyLocation): Task {
    source.sort((a, b): number => {
        return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
    });
    // get stuff or move towards source
    // typeof(source) == "Resource"
    const res = creep.withdraw(source[0], RESOURCE_ENERGY);
    if (res == ERR_NOT_IN_RANGE) {
        creep.moveTo(source[0], { visualizePathStyle: { stroke: '#ffaa00' } });
    }
    else if (res == OK) {
        creep.memory.lastChargeSource = lastChargeSource;
    }
    else {
        log(`[${creep.room.name}][${creep.name}] withdraw(${source[0]}) failed: ${res}`, Loglevel.ERROR);
    }
    return creep.memory.task;
}

function pickupItem(creep: Creep, item: Resource[], sortByDistance: boolean, lastChargeSource: EnergyLocation): Task {
    item.sort((a, b): number => {
        return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
    });
    // get stuff or move towards source
    // typeof(source) == "Resource"
    const res = creep.pickup(item[0]);
    if (res == ERR_NOT_IN_RANGE) {
        creep.moveTo(item[0], { visualizePathStyle: { stroke: '#ffaa00' } });
    }
    else if (res == OK) {
        creep.memory.lastChargeSource = lastChargeSource;
    }
    else {
        log(`[${creep.room.name}][${creep.name}] pickup(${item[0]}) failed: ${res}`, Loglevel.ERROR);
    }
    return creep.memory.task;
}

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

function check(creep: Creep): boolean {

    if (!creep.memory.occupation.some((trait: Trait) => chargeTraits.includes(trait))) {
        return false;
    }

    // do not interrupt charging
    if (creep.memory.task == Task.CHARGE && creep.store.getFreeCapacity() > 0) {
        return true;
    }

    if ((creep.store[RESOURCE_ENERGY] == 0) || (/*idleTasks.includes(creep.memory.task) && */creep.store.getFreeCapacity() > 0)) {
        if ((creep.memory.occupation.includes(Trait.CHARGE_LOCAL) && (creep.room.name == creep.memory.homeBase)) ||
            creep.memory.occupation.includes(Trait.CHARGE_AWAY) && (creep.room.name != creep.memory.homeBase) ||
            (creep.memory.homeBase == "")) {
            return true;
        }
    }
    return false;
}

export function execute(creep: Creep): boolean {
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
                return !isNearHostile(structure, hostiles) && structure.store[RESOURCE_ENERGY] > 0 && structure.pos.getRangeTo(creep.pos) < Config.tombstoneMaxDistance;
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

        // container
        if (creep.memory.lastEnergyDeposit != EnergyLocation.CONTAINER && creep.memory.occupation.includes(Trait.CHARGE_STORAGE)) {
            const container = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return !isNearHostile(structure, hostiles) && containerTypes.includes(structure.structureType) &&
                        ((structure as StructureContainer).store[RESOURCE_ENERGY] > 0);
                }
            }) as StructureContainer[];
            if (container.length > 0) {
                withdrawEnergy(creep, container, true, EnergyLocation.CONTAINER);
                return true;
            }
        }


        const sources: Source[] = creep.room.find(FIND_SOURCES, {
            filter: (source) => {
                return !isNearHostile(source, hostiles) && (source.energy > 0 || source.ticksToRegeneration < 40);
            }
        }) as Source[];
        if (sources.length > 0) {

            let sourceId = 0;
            // randomly select a source; static per creep
            if (creep.memory.homeBase == creep.room.name) {
                sourceId = creep.memory.percentile % sources.length ;
            }
            else {
                // sort by distance if in another room
                sources.sort((a: Source, b: Source): number => {
                    return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
                });
            }

            // harvest or move towards source
            const res = creep.harvest(sources[sourceId]);
            if (res == OK) {
                creep.memory.lastChargeSource = EnergyLocation.SOURCE;
            }
            else if (res == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[sourceId], { visualizePathStyle: { stroke: '#ffaa00' } });
            }
            else {
                console.log(`[ERROR] harvest(${sources[sourceId]}): ${res}`)
                return false;
            }
            return true;
        }
        else {
            return false;
        }
    }
    return false;
}
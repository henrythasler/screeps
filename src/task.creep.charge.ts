import { Task, nonInterruptableTasks, idleTasks } from "./task";
import { EnergyLocation } from "./manager.global";
import { Trait } from "./trait";

const containerTypes: StructureConstant[] = [STRUCTURE_CONTAINER, STRUCTURE_STORAGE];
const chargeTraits: Trait[] = [Trait.CHARGE_SOURCE, Trait.CHARGE_STORAGE];

const canCharge = (trait: Trait) => chargeTraits.includes(trait);

export function check(creep: Creep): Task {
    if (creep.memory.occupation.some(canCharge) && !nonInterruptableTasks.includes(creep.memory.task)) {
        if ((creep.store[RESOURCE_ENERGY] < 10) || (idleTasks.includes(creep.memory.task) && (creep.store.getFreeCapacity() > 0))) {
            return Task.CHARGE;
        }
    }
    return creep.memory.task;
}

export function execute(creep: Creep): Task {
    if (creep.memory.task == Task.CHARGE) {
        if (creep.store.getFreeCapacity() > 0) {

            // FIXME: add available Resources for harvesting

            // FIXME: remove occupied sources where no path leads to within 1 tile of the source
            // sources.filter( (source) => {
            //     return (source.pos.findInRange(FIND_CREEPS, 1).length < 3); 
            // });

            // sort by distance
            // sources.sort((a: Source, b: Source): number => {
            //     return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
            // });

            const tombstones: Tombstone[] = creep.room.find(FIND_TOMBSTONES, {
                filter: (structure) => {
                    return structure.store[RESOURCE_ENERGY] > 0;
                }
            });
            if (tombstones.length > 0) {
                tombstones.sort((a: Tombstone, b: Tombstone): number => {
                    return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
                });
                // get stuff or move towards source
                if (creep.withdraw(tombstones[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(tombstones[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                return creep.memory.task;
            }

            const ruins: Ruin[] = creep.room.find(FIND_RUINS, {
                filter: (structure) => {
                    return structure.store[RESOURCE_ENERGY] > 0;
                }
            });
            if (ruins.length > 0) {
                ruins.sort((a: Ruin, b: Ruin): number => {
                    return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
                });
                // get stuff or move towards source
                if (creep.withdraw(ruins[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(ruins[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                return creep.memory.task;
            }

            if (creep.memory.lastEnergyDeposit != EnergyLocation.CONTAINER) {
                const container = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (containerTypes.includes(structure.structureType) &&
                            ((structure as StructureContainer).store[RESOURCE_ENERGY] > 0));
                    }
                }) as StructureContainer[];
                if (container.length > 0) {
                    container.sort((a: StructureContainer, b: StructureContainer): number => {
                        return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
                    });
                    // get stuff or move towards source
                    if (creep.withdraw(container[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(container[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                    else {
                        creep.memory.lastChargeSource = EnergyLocation.CONTAINER;
                    }
                    return creep.memory.task;
                }
            }


            const sources: Source[] = creep.room.find(FIND_SOURCES, {
                filter: (source) => {
                    return source.energy > 0;
                }
            }) as Source[];
            if (sources.length > 0) {
                // randomly select a source; static per creep
                const sourceId = creep.memory.percentile % sources.length;

                // harvest or move towards source
                if (creep.harvest(sources[sourceId]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[sourceId], { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                else {
                    creep.memory.lastChargeSource = EnergyLocation.SOURCE;
                }
                return creep.memory.task;
            }
            // else {
            //     const exits = creep.room.find(FIND_EXIT_BOTTOM);
            //     creep.moveTo(exits[0]);
            // }
        }
        // energy is full, so we can do some work
        else {
            return Task.IDLE;
        }
    }
    return creep.memory.task;
}
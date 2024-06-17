import { idleTasks, nonInterruptableTasks } from "./trait.global";
import { Task } from "./types";

const containerTypes: StructureConstant[] = [STRUCTURE_CONTAINER];

export function check(creep: Creep): Task {
    if ((creep.memory.task != Task.CHARGE) && (nonInterruptableTasks.indexOf(creep.memory.task) < 0) && (creep.store[RESOURCE_ENERGY] == 0) ||
        ((idleTasks.indexOf(creep.memory.task) >= 0) && (creep.store.getFreeCapacity() > 0))
    ) {
        return Task.CHARGE;
    }
    return creep.memory.task;
}

export function execute(creep: Creep): Task {
    if (creep.memory.task == Task.CHARGE) {
        if (creep.store.getFreeCapacity() > 0) {

            // FIXME: add available Tombstones for harvesting
            // FIXME: add available Resources for harvesting

            // FIXME: remove occupied sources where no path leads to within 1 tile of the source
            // sources.filter( (source) => {
            //     return (source.pos.findInRange(FIND_CREEPS, 1).length < 3); 
            // });

            // sort by distance
            // sources.sort((a: Source, b: Source): number => {
            //     return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
            // });

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

            // FIXME: prevent creeps from charging from a container and the storing into the same container
            // const container = creep.room.find(FIND_STRUCTURES, {
            //     filter: (structure) => {
            //         return (containerTypes.includes(structure.structureType) &&
            //             ((structure as StructureContainer).store[RESOURCE_ENERGY] > 0));
            //     }
            // }) as StructureContainer[];
            // if(container.length > 0) {
            //     container.sort((a: StructureContainer, b: StructureContainer): number => {
            //         return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
            //     });
            //     // get stuff or move towards source
            //     if (creep.withdraw(container[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            //         creep.moveTo(container[0], { visualizePathStyle: { stroke: '#ffaa00' } });
            //     }
            //     return creep.memory.task;
            // }
        

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
                return creep.memory.task;
            }
        }
        // energy is full, so we can do some work
        else {
            return Task.IDLE;
        }
    }
    return creep.memory.task;
}
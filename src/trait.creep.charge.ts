import { idleTasks, nonInterruptableTasks } from "./trait.global";
import { Task } from "./types";

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
            const sources: Source[] = creep.room.find(FIND_SOURCES) as Source[];
            // FIXME: remove empty sources

            const ruins: Ruin[] = creep.room.find(FIND_RUINS, {
                filter: (structure) => {
                    return structure.store[RESOURCE_ENERGY] > 0;
                }
            });

            const stores: Store<RESOURCE_ENERGY, false>[] = [];


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

            // randomly select a source; static per creep
            const sourceId = creep.memory.percentile % sources.length;

            // harvest or move towards source
            if (creep.harvest(sources[sourceId]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[sourceId], { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
        // energy is full, so we can do some work
        else {
            return Task.IDLE;
        }
    }
    return creep.memory.task;
}
import { nonInterruptableTasks } from "./trait.global";
import { Task } from "./types";

export function check(creep: Creep): Task {
    const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
    if ((constructionSites.length > 0) && (nonInterruptableTasks.indexOf(creep.memory.task) < 0)) {
        return Task.BUILD_STRUCTURE;
    }
    return creep.memory.task;
}

export function execute(creep: Creep): Task {
    if (creep.memory.task == Task.BUILD_STRUCTURE) {
        const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (constructionSites.length) {
            if (creep.build(constructionSites[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(constructionSites[0], { visualizePathStyle: { stroke: '#ffff00' } });
            }
        }
    }
    return creep.memory.task;
}
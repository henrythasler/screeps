import { Task, nonInterruptableTasks } from "./task";
import { Trait } from "./trait";

// export function check(creep: Creep): Task {
//     if (creep.memory.occupation.includes(Trait.BUILD_STRUCTURE)) {
//         const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
//         if (constructionSites.length > 0 && !nonInterruptableTasks.includes(creep.memory.task)) {
//             return Task.BUILD_STRUCTURE;
//         }
//     }
//     return creep.memory.task;
// }

export function execute(creep: Creep): boolean {
    const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
    if (constructionSites.length && creep.memory.occupation.includes(Trait.BUILD_STRUCTURE)) {
        creep.memory.task = Task.BUILD_STRUCTURE;
        if (creep.build(constructionSites[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(constructionSites[0], { visualizePathStyle: { stroke: '#ffff00' } });
        }
        return true;
    }
    return false;
}
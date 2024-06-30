import { actionAllowed } from "./helper";
import { log, Loglevel } from "./debug";
import { EnergyLocation } from "./manager.global";
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
    if (constructionSites.length && creep.memory.occupation.includes(Trait.BUILD_STRUCTURE) && actionAllowed(creep)) {
        creep.memory.task = Task.BUILD_STRUCTURE;

        // build by creation order (do not sort)
        const res = creep.build(constructionSites[0]);
        if (res == OK) {
            creep.memory.lastEnergyDeposit = EnergyLocation.OTHER;
        }
        else if (res == ERR_NOT_IN_RANGE) {
            creep.moveTo(constructionSites[0], { visualizePathStyle: { stroke: '#ffff00' } });
        }
        else {
            log(`[${creep.room.name}][${creep.name}] build(${constructionSites[0]}) failed: ${res}`, Loglevel.ERROR);
        }
        return true;
    }
    return false;
}
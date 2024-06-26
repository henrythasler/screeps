import { Config } from "./config";
import { Task, nonInterruptableTasks } from "./task";
import { Trait } from "./trait";

// export function check(creep: Creep): Task {
//     if (creep.memory.occupation.includes(Trait.CLAIM_CONTROLLER)) {
//         const controller = creep.room.controller;
//         if (controller && (!controller.my) && (nonInterruptableTasks.indexOf(creep.memory.task) < 0) && (Game.gcl.level > 1)) {
//             return Task.CLAIM_CONTROLLER;
//         }
//     }
//     return creep.memory.task;
// }

export function execute(creep: Creep): boolean {
    const controller = creep.room.controller;
    if (controller && !controller.my && Game.gcl.level > 1 && creep.memory.occupation.includes(Trait.CLAIM_CONTROLLER)) {
        creep.memory.task = Task.CLAIM_CONTROLLER;
        const res = creep.claimController(controller);
        if (res == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, { visualizePathStyle: { stroke: '#ff0000' } });
        }
        else if (res != OK) {
            console.log(`claimController() failed: ${res}`);
            // creep.moveTo(controller, { visualizePathStyle: { stroke: '#ff0000' } });
        }
        return true;
    }
    return false;
}
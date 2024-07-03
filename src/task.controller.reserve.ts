import { Config } from "./config";
import { Task } from "./task";
import { Trait } from "./trait";

// export function check(creep: Creep): Task {
//     if (creep.memory.occupation.includes(Trait.RESERVE_CONTROLLER)) {
//         const controller = creep.room.controller;
//         if (controller && (!controller.my) && (nonInterruptableTasks.indexOf(creep.memory.task) < 0)) {
//             return Task.RESERVE_CONTROLLER;
//         }
//     }
//     return creep.memory.task;
// }

export function execute(creep: Creep): boolean {
    const controller = creep.room.controller;
    if (controller && !controller.my && creep.memory.occupation.includes(Trait.RESERVE_CONTROLLER)) {
        creep.memory.task == Task.RESERVE_CONTROLLER;
        const res = creep.reserveController(controller);
        if (res == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, { visualizePathStyle: { stroke: '#ff0000' } });
        }
        else if (res != OK) {
            console.log(`reserveController() failed: ${res}`);
            creep.moveTo(controller, { visualizePathStyle: { stroke: '#ff0000' } });
        }
        return true;
    }
    return false;
}
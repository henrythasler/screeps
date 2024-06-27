import { Config } from "./config";
import { EnergyLocation } from "./manager.global";
import { Task, nonInterruptableTasks, idleTasks } from "./task";
import { Trait } from "./trait";


// export function check(creep: Creep): Task {
//     if (creep.memory.occupation.includes(Trait.RECHARGE_CONTROLLER)) {
//         const controller = creep.room.controller;
//         if ((nonInterruptableTasks.indexOf(creep.memory.task) < 0) && controller) {
//             if ((controller.level < Config.minControllerLevel) && (controller.progress < controller.progressTotal)) {
//                 return Task.CHARGE_CONTROLLER;
//             }
//         }
//     }
//     return creep.memory.task;
// }

export function execute(creep: Creep): boolean {
    const controller = creep.room.controller;
    if (controller && creep.memory.occupation.includes(Trait.RECHARGE_CONTROLLER) &&
        controller.level < Config.minControllerLevel &&
        controller.progress < controller.progressTotal) {
        creep.memory.task = Task.CHARGE_CONTROLLER;
        
        const res = creep.upgradeController(controller);
        if (res == OK) {
            creep.memory.lastEnergyDeposit = EnergyLocation.OTHER;
        }
        else if (res == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, { visualizePathStyle: { stroke: '#00ff00' } });
        }
        else {
            console.log(`upgradeController(${controller.room.name}) failed: ${res}`);
        }
        return true;
    }
    return false;
}
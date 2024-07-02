import { Loglevel, log } from "./debug";
import { Config } from "./config";
import { EnergyLocation } from "./manager.global";
import { Task } from "./task";
import { Trait } from "./trait";

// export function check(creep: Creep): Task {
//     if (creep.memory.occupation.includes(Trait.REFRESH_CONTROLLER)) {
//         const controller = creep.room.controller;
//         if ((creep.memory.task != Task.REFRESH_CONTROLLER) && (nonInterruptableTasks.indexOf(creep.memory.task) < 0) && controller) {
//             // FIXME: derive limits from level
//             if (controller.ticksToDowngrade < 36000) {
//                 return Task.REFRESH_CONTROLLER;
//             }
//         }
//     }
//     return creep.memory.task;
// }

const downgradeTicksPerLevel: number[] = [0, 20000, 10000, 20000, 40000, 80000, 120000, 150000, 200000];

export function execute(creep: Creep): boolean {
    const controller = creep.room.controller;
    const ratio = (creep.memory.task == Task.REFRESH_CONTROLLER) ? 1 : Config.minControllerRefreshTicksRatio;
    // log(`name: ${creep.name}, ratio: ${ratio}, task: ${creep.memory.task}`, Loglevel.DEBUG);
    if (controller && creep.memory.occupation.includes(Trait.REFRESH_CONTROLLER) &&
        controller.ticksToDowngrade < (downgradeTicksPerLevel[controller.level] * ratio) &&
        creep.store[RESOURCE_ENERGY] > 0) {
        creep.memory.task = Task.REFRESH_CONTROLLER;

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
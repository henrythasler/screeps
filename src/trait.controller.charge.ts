import { Config } from "./config";
import { nonInterruptableTasks } from "./trait.global";
import { EnergyLocation, Task } from "./manager.global";

export function check(creep: Creep): Task {
    if (creep.memory.traits.includes(Task.CONTROLLER_CHARGE)) {
        const controller = creep.room.controller;
        if ((nonInterruptableTasks.indexOf(creep.memory.task) < 0) && controller) {
            if ((controller.level < Config.minControllerLevel) && (controller.progress < controller.progressTotal)) {
                return Task.CONTROLLER_CHARGE;
            }
        }
    }
    return creep.memory.task;
}

export function execute(creep: Creep): Task {
    const controller = creep.room.controller;
    if ((creep.memory.task == Task.CONTROLLER_CHARGE) && controller) {
        const res = creep.upgradeController(controller);
        if(res == OK) {
            creep.memory.lastEnergyDeposit = EnergyLocation.OTHER;
        }
        else if (res == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, { visualizePathStyle: { stroke: '#00ff00' } });
        }
        else {
            console.log(`upgradeController(${controller.room.name}) failed: ${res}`);
        }
    }
    return creep.memory.task;
}
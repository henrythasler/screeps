import { Config } from "./config";
import { nonInterruptableTasks } from "./trait.global";
import { Task } from "./types";

export function check(creep: Creep): Task {
    const controller = creep.room.controller;
    if ((nonInterruptableTasks.indexOf(creep.memory.task) < 0) && controller) {
        if ((controller.ticksToDowngrade < 1000) ||
            (controller.level < Config.minControllerLevel) && (controller.progress < controller.progressTotal)) {
            return Task.CHARGE_CONTROLLER;
        }
    }
    return creep.memory.task;
}

export function execute(creep: Creep): Task {
    const controller = creep.room.controller;
    if ((creep.memory.task == Task.CHARGE_CONTROLLER) && controller) {
        if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, { visualizePathStyle: { stroke: '#00ff00' } });
        }
    }
    return creep.memory.task;
}
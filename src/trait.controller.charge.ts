import { Config } from "./config";
import { nonInterruptableTasks } from "./trait.global";
import { Task } from "./types";

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
        if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, { visualizePathStyle: { stroke: '#00ff00' } });
        }
    }
    return creep.memory.task;
}
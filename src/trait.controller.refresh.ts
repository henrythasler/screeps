import { Config } from "./config";
import { nonInterruptableTasks } from "./trait.global";
import { Task } from "./types";

export function check(creep: Creep): Task {
    if (creep.memory.traits.includes(Task.CONTROLLER_REFRESH)) {
        const controller = creep.room.controller;
        if ((creep.memory.task != Task.CONTROLLER_REFRESH) && (nonInterruptableTasks.indexOf(creep.memory.task) < 0) && controller) {
            if (controller.ticksToDowngrade < 7000) {
                return Task.CONTROLLER_REFRESH;
            }
        }
    }
    return creep.memory.task;
}

export function execute(creep: Creep): Task {
    const controller = creep.room.controller;
    if ((creep.memory.task == Task.CONTROLLER_REFRESH) && controller) {
        if ((controller.ticksToDowngrade < 9000) && (creep.store[RESOURCE_ENERGY] > 0)) {
            if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller, { visualizePathStyle: { stroke: '#00ff00' } });
            }
        }
        else {
            return Task.IDLE;
        }
    }
    return creep.memory.task;
}
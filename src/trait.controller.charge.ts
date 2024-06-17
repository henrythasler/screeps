import { Config } from "./config";
import { nonInterruptableTasks } from "./trait.global";
import { Task } from "./types";

export function check(creep: Creep): Task {
    const controller = creep.room.controller;
    if (nonInterruptableTasks.indexOf(creep.memory.task) < 0) {
        if (controller && (controller.ticksToDowngrade < 1000) ||
            controller && (controller.level < Config.minControllerLevel) && (controller.progress < controller.progressTotal)) {
            return Task.CHARGE_CONTROLLER;
        }
    }
    return creep.memory.task;
}

export function execute(creep: Creep): Task {
    return creep.memory.task;
}
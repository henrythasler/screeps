import { Config } from "./config";
import { nonInterruptableTasks } from "./trait.global";
import { Task } from "./manager.global";

export function check(creep: Creep): Task {
    if (creep.memory.traits.includes(Task.CONTROLLER_CLAIM)) {
        const controller = creep.room.controller;
        if (controller && (!controller.my) && (nonInterruptableTasks.indexOf(creep.memory.task) < 0)) {
            return Task.CONTROLLER_CLAIM;
        }
    }
    return creep.memory.task;
}

export function execute(creep: Creep): Task {
    const controller = creep.room.controller;
    if ((creep.memory.task == Task.CONTROLLER_CLAIM) && controller) {
        const res = creep.claimController(controller);
        if (res == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, { visualizePathStyle: { stroke: '#ff0000' } });
        }
        else {
            console.log(`claimController() failed: ${res}`);
            creep.moveTo(controller, { visualizePathStyle: { stroke: '#ff0000' } });
        }
    }
    return creep.memory.task;
}
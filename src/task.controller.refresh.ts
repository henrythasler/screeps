import { Config } from "./config";
import { EnergyLocation } from "./manager.global";
import { Task, nonInterruptableTasks } from "./task";

export function check(creep: Creep): Task {
    if (creep.memory.traits.includes(Task.REFRESH_CONTROLLER)) {
        const controller = creep.room.controller;
        if ((creep.memory.task != Task.REFRESH_CONTROLLER) && (nonInterruptableTasks.indexOf(creep.memory.task) < 0) && controller) {
            if (controller.ticksToDowngrade < 7000) {
                return Task.REFRESH_CONTROLLER;
            }
        }
    }
    return creep.memory.task;
}

export function execute(creep: Creep): Task {
    const controller = creep.room.controller;
    if ((creep.memory.task == Task.REFRESH_CONTROLLER) && controller) {
        if ((controller.ticksToDowngrade < 9000) && (creep.store[RESOURCE_ENERGY] > 0)) {
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
        else {
            return Task.IDLE;
        }
    }
    return creep.memory.task;
}
import { Config } from "./config";
import { EnergyLocation } from "./manager.global";
import { Task } from "./task";
import { Trait } from "./trait";

export function execute(creep: Creep): boolean {
    const controller = creep.room.controller;
    const minControllerLevel = Config.minControllerLevel.get(creep.room.name) ?? 0;
    if (controller && creep.memory.occupation.includes(Trait.RECHARGE_CONTROLLER) &&
        controller.level < minControllerLevel &&
        controller.progress < controller.progressTotal) {
        creep.memory.task = Task.CHARGE_CONTROLLER;
        
        const res = creep.upgradeController(controller);
        if (res == OK) {
            creep.memory.lastEnergyDeposit = EnergyLocation.OTHER;
        }
        else if (res == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, { visualizePathStyle: { stroke: '#00ff00' } });
        }
        else if (res != ERR_NOT_ENOUGH_RESOURCES){
            console.log(`upgradeController(${controller.room.name}) failed: ${res}`);
        }
        return true;
    }
    return false;
}
import { Task } from "./task";
import { EnergyLocation } from "./manager.global";
import { Trait } from "./trait";
import { isInHomeBase, mergeArrays, removeEntries } from "./helper";
import { categorizeCreepLocation, Location } from "./location";
import { zoo } from "./zoo";
import { Config } from "./config";
import { log, Loglevel } from "./debug";

export function execute(creep: Creep): boolean {
    const species = zoo.get(creep.memory.role)?.get(creep.memory.speciesName);
    if (species) {
        const location = categorizeCreepLocation(creep.room, creep.memory.homeBase);

        // derive available traits for the current room and general traits
        const traits = removeEntries(mergeArrays(species.traits.get(location), species.traits.get(Location.EVERYWHERE)), species.traits.get(Location.NOWHERE));

        if (!traits.includes(Trait.UPGRADE_CONTROLLER) || creep.store[RESOURCE_ENERGY] == 0) {
            return false;
        }

        const controller = creep.room.controller;
        const minControllerLevel = Config.minControllerLevel.get(creep.room.name) ?? 0;

        if (controller && controller.level < minControllerLevel && controller.progress < controller.progressTotal) {

            const res = creep.upgradeController(controller);
            if (res == OK) {
                creep.memory.lastEnergyDeposit = EnergyLocation.OTHER;
            }
            else if (res == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller, { visualizePathStyle: Config.visualizePathStyle.get(Task.UPGRADE_CONTROLLER) });
            }
            else {
                log(`upgradeController(${controller.room.name}) failed: ${res}`, Loglevel.ERROR);
                return false;
            }

            creep.memory.task = Task.UPGRADE_CONTROLLER;
            return true;
        }
    }
    return false;

    /*    
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
    */
    // return false;
}
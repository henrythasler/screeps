import { Task } from "./task";
import { Trait } from "./trait";
import { mergeArrays, removeEntries } from "./helper";
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

        if (!traits.includes(Trait.CLAIM_CONTROLLER)) {
            return false;
        }

        const controller = creep.room.controller;
        if(controller && !controller.my && Config.minControllerLevel.get(creep.room.name)) {
            const res = creep.claimController(controller);
            if (res == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller, { visualizePathStyle: Config.visualizePathStyle.get(Task.CLAIM_CONTROLLER) });
            }
            else if (res != OK) {
                log(`reserveController(${controller.room.name}) failed: ${res}`, Loglevel.ERROR);
                return false;
            }
            creep.memory.task = Task.CLAIM_CONTROLLER;
            return true;
        }

    }
    return false;
    /*    
        const controller = creep.room.controller;
        if (controller && !controller.my && Game.gcl.level > 1 &&
            creep.memory.occupation.includes(Trait.CLAIM_CONTROLLER)) {
            creep.memory.task = Task.CLAIM_CONTROLLER;
            const res = creep.claimController(controller);
            if (res == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller, { visualizePathStyle: { stroke: '#ff0000' } });
            }
            else if (res != OK) {
                console.log(`claimController() failed: ${res}`);
                // creep.moveTo(controller, { visualizePathStyle: { stroke: '#ff0000' } });
            }
            return true;
        }
    */
}
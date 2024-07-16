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

        if (!traits.includes(Trait.RESERVE_CONTROLLER)) {
            return false;
        }

        const controller = creep.room.controller;
        // only reserve if at least one other creep (besides the scout) is in the room
        if (controller && !controller.my && creep.room.find(FIND_MY_CREEPS).length >= 2) {
            const res = creep.reserveController(controller);
            if (res == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller, { visualizePathStyle: Config.visualizePathStyle.get(Task.RESERVE_CONTROLLER) });
            }
            else if (res != OK) {
                log(`reserveController(${controller.room.name}) failed: ${res}`, Loglevel.ERROR);
                return false;
            }
            creep.memory.task = Task.RESERVE_CONTROLLER;
            return true;
        }
    }
    return false;
}
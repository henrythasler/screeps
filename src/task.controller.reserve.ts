import { Task } from "./task";
import { Trait } from "./trait";
import { getCreepsByRole, mergeArrays, removeEntries } from "./helper";
import { categorizeCreepLocation, Location } from "./location";
import { zoo } from "./zoo";
import { Config } from "./config";
import { log, Loglevel } from "./debug";

export function execute(creep: Creep, maxHops: number = 1): boolean {
    const species = zoo.get(creep.memory.role)?.get(creep.memory.speciesName);
    if (species) {
        const location = categorizeCreepLocation(creep.room, creep.memory.homeBase);

        // derive available traits for the current room and general traits
        const traits = removeEntries(mergeArrays(species.traits.get(location), species.traits.get(Location.EVERYWHERE)), species.traits.get(Location.NOWHERE));

        if (!traits.includes(Trait.RESERVE_CONTROLLER)) {
            return false;
        }

        // reserve adjacent rooms for collecting resources
        const route = Game.map.findRoute(creep.memory.homeBase, creep.room);
        if (route == ERR_NO_PATH || route.length > maxHops) return false;

        const controller = creep.room.controller;
        if (controller && !controller.my) {
            const ownRange = creep.pos.getRangeTo(controller.pos);
            const similarCreeps = getCreepsByRole(creep.room, creep.memory.role);

            if (similarCreeps.some((otherCreep: Creep) => {
                return otherCreep.pos.getRangeTo(controller.pos) < ownRange;
            })) {
                return false;
            }

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
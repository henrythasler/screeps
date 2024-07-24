import { Loglevel, log } from "./debug";
import { roomInfoMap } from "./room.info";
import { Task } from "./task";
import { Trait } from "./trait";
import { categorizeCreepLocation, Location } from "./location";
import { zoo } from "./zoo";
import { isInHomeBase, isOnBorder, mergeArrays, removeEntries } from "./helper";
import { Config } from "./config";


export function execute(creep: Creep, ignoreCapacity: boolean = false): boolean {
    const species = zoo.get(creep.memory.role)?.get(creep.memory.speciesName);
    if (species) {
        const location = categorizeCreepLocation(creep.room, creep.memory.homeBase);

        // derive available traits for the current room and general traits
        const traits = removeEntries(mergeArrays(species.traits.get(location), species.traits.get(Location.EVERYWHERE)), species.traits.get(Location.NOWHERE));

        if (!traits.includes(Trait.SWITCH_ROOM) || (isInHomeBase(creep) && !isOnBorder(creep))) {
            return false;
        }

        if (!ignoreCapacity && creep.store.getFreeCapacity() > 0) {
            return false;
        }

        const pos = new RoomPosition(25, 25, creep.memory.homeBase);
        const res = creep.moveTo(pos, { visualizePathStyle: Config.visualizePathStyle.get(Task.SWITCH_ROOM) });

        if (res == OK || res == ERR_TIRED) {
            creep.memory.task = Task.RETURN;
            return true;
        }
    }
    return false;
}
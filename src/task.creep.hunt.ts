import { Loglevel, log } from "./debug";
import { roomInfoMap } from "./room.info";
import { Task } from "./task";
import { Trait } from "./trait";
import { categorizeCreepLocation, Location } from "./location";
import { zoo } from "./zoo";
import { getCreepsByRole, mergeArrays, removeEntries } from "./helper";
import { Config } from "./config";
import { Role } from "./manager.global";

/**
 * 
 * @param creep 
 * @param maxHops
 * @param squadSize number of similar creeps that are required before the task is executed
 * @returns 
 */
export function execute(creep: Creep, maxHops: number = 1, squadSize: number = 2): boolean {
    const species = zoo.get(creep.memory.role)?.get(creep.memory.speciesName);
    if (species) {
        const location = categorizeCreepLocation(creep.room, creep.memory.homeBase);

        // derive available traits for the current room and general traits
        const traits = removeEntries(mergeArrays(species.traits.get(location), species.traits.get(Location.EVERYWHERE)), species.traits.get(Location.NOWHERE));

        const availableHunters = getCreepsByRole(creep.room, creep.memory.role).length;

        if (!traits.includes(Trait.SWITCH_ROOM) || availableHunters < squadSize) {
            return false;
        }

        const locations: string[] = [];
        roomInfoMap.forEach((roomInfo, roomName) => {
            if (roomInfo.hostile && creep.room.name != roomName ) {
                locations.push(roomName);
            }
        });

        const filteredLocations = locations.filter((roomName) => {
            const route = Game.map.findRoute(creep.memory.homeBase, roomName);
            if (route == ERR_NO_PATH) return false;
            return route.length <= maxHops;
        });


        if (filteredLocations.length) {
            const pos = new RoomPosition(25, 25, filteredLocations[0]!);
            const res = creep.moveTo(pos, { visualizePathStyle: Config.visualizePathStyle.get(Task.SWITCH_ROOM) });
            if (res == OK || res == ERR_TIRED) {
                creep.memory.task = Task.SWITCH_ROOM;
                return true;
            }
        }
    }
    return false;
}
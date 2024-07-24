import { Loglevel, log } from "./debug";
import { roomInfoMap } from "./room.info";
import { Task } from "./task";
import { Trait } from "./trait";
import { categorizeCreepLocation, Location } from "./location";
import { zoo } from "./zoo";
import { mergeArrays, removeEntries } from "./helper";
import { Config } from "./config";

export function execute(creep: Creep, maxHops: number = 1): boolean {
    const species = zoo.get(creep.memory.role)?.get(creep.memory.speciesName);
    if (species) {
        const location = categorizeCreepLocation(creep.room, creep.memory.homeBase);

        // derive available traits for the current room and general traits
        const traits = removeEntries(mergeArrays(species.traits.get(location), species.traits.get(Location.EVERYWHERE)), species.traits.get(Location.NOWHERE));

        if (!traits.includes(Trait.SWITCH_ROOM) || creep.store.getFreeCapacity() == 0) {
            return false;
        }

        const locations: string[] = [];
        roomInfoMap.forEach((roomInfo, roomName) => {
            if (roomInfo.availableSources && !roomInfo.hostile && !roomInfo.occupied && !roomInfo.base && 
                roomName != creep.memory.homeBase && creep.room.name != roomName ) {
                locations.push(roomName);
            }
        });

        const filteredLocations = locations.filter((roomName) => {
            const route = Game.map.findRoute(creep.memory.homeBase, roomName);
            if (route == ERR_NO_PATH) return false;
            return route.length <= maxHops;
        });

        if (filteredLocations.length) {
            const pos = new RoomPosition(25, 25, filteredLocations[creep.memory.percentile % filteredLocations.length]!);
            const res = creep.moveTo(pos, { visualizePathStyle: Config.visualizePathStyle.get(Task.SWITCH_ROOM) });
            if (res == OK || res == ERR_TIRED) {
                creep.memory.task = Task.SWITCH_ROOM;
                return true;
            }
        }
    }
    return false;
}
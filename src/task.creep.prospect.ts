import { Loglevel, log } from "./debug";
import { roomInfoMap } from "./room.info";
import { Task } from "./task";
import { Trait } from "./trait";
import { categorizeCreepLocation, Location } from "./location";
import { zoo } from "./zoo";
import { mergeArrays, removeEntries } from "./helper";
import { Config } from "./config";

export function execute(creep: Creep, maxHops: number): boolean {
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
            if (roomInfo.availableSources && !roomInfo.hostile && !roomInfo.reserved && roomName != creep.memory.homeBase) {
                locations.push(roomName);
            }
        });

        const filteredLocations = locations.filter((roomName) => {
            // const path: PathFinderPath = PathFinder.search(creep.pos, target.pos);
            // const hops = countRoomHops(path.path);
            // const hops = countLinearHops(creep.memory.homeBase, target.room.name);

            const route = Game.map.findRoute(creep.room.name, roomName);
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
    /*    
        if (creep.memory.occupation.includes(Trait.SWITCH_ROOM) && creep.store.getFreeCapacity() > 0) {
    
            const locations: string[] = [];
            roomInfoMap.forEach( (roomInfo, roomName) => {
                if(roomInfo.availableSources && !roomInfo.hostile && !roomInfo.reserved) {
                    locations.push(roomName);
                }
            });
    
            const filteredLocations = locations.filter((roomName) => {
                    // const path: PathFinderPath = PathFinder.search(creep.pos, target.pos);
                    // const hops = countRoomHops(path.path);
                    // const hops = countLinearHops(creep.memory.homeBase, target.room.name);
                    const hops = Game.map.getRoomLinearDistance(creep.room.name, roomName);
                    log(`[${creep.room.name}][${creep.name}] countRoomHops: ${hops} to ${roomName}, allowed: ${actionAllowed(creep, roomName)}`, Loglevel.DEBUG);
                    return actionAllowed(creep, roomName) && hops <= maxHops;
            });
    
            if (filteredLocations.length) {
                const res = creep.moveTo(new RoomPosition(25, 25, filteredLocations[creep.memory.percentile % filteredLocations.length]!), { visualizePathStyle: { stroke: '#4040ff' } })
                if(res == OK) {
                    creep.memory.task = Task.SWITCH_ROOM;
                    return true;    
                }
            }
        }
    */
}
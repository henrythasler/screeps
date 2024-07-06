import { Loglevel, log } from "./debug";
import { actionAllowed } from "./helper";
import { roomInfoMap } from "./roominfo";
import { Task } from "./task";
import { Trait } from "./trait";


export function execute(creep: Creep, maxHops: number): boolean {
    if (creep.memory.occupation.includes(Trait.SWITCH_ROOM) && creep.store.getFreeCapacity() > 0) {

        const locations: string[] = [];
        roomInfoMap.forEach( (roomInfo, roomName) => {
            if(roomInfo.availableSources && !roomInfo.hostile) {
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
            const res = creep.moveTo(new RoomPosition(25, 25, filteredLocations[0]!), { visualizePathStyle: { stroke: '#4040ff' } })
            if(res == OK) {
                creep.memory.task = Task.SWITCH_ROOM;
                return true;    
            }
        }
    }
    return false;
}
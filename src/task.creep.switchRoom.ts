import { log, Loglevel } from "./debug";
import { countRoomHops } from "./helper";
import { Task, nonInterruptableTasks } from "./task";
import { Trait } from "./trait";

// export function check(creep: Creep): Task {
//     if (creep.memory.occupation.includes(Trait.SWITCH_ROOM)) {
//         const exits = creep.room.find(FIND_EXIT);
//         if ((exits.length > 0) && (nonInterruptableTasks.indexOf(creep.memory.task) < 0)) {
//             return Task.SWITCH_ROOM;
//         }
//     }
//     return creep.memory.task;
// }

export function execute(creep: Creep, locations: (Id<Source> | Id<StructureSpawn>)[]): boolean {
    if (creep.memory.occupation.includes(Trait.SWITCH_ROOM) && locations.length) {

        const filteredLocations = locations.filter((item) => {
            const target = Game.getObjectById(item);
            if(target) {
                // const path: PathFinderPath = PathFinder.search(creep.pos, target.pos);
                // const hops = countRoomHops(path.path);
                // const hops = countLinearHops(creep.memory.homeBase, target.room.name);
                // log(`countRoomHops: ${hops}`, Loglevel.INFO);
                const hops = Game.map.getRoomLinearDistance(creep.room.name, target.room.name);
                return target.room.name != creep.memory.homeBase && hops <= 2;
            }
            return false;
            // return Game.getObjectById(item)?.room.name != creep.memory.homeBase;
        });

        if (filteredLocations.length) {
            creep.memory.task = Task.SWITCH_ROOM;
            const pos = Game.getObjectById(filteredLocations[0])?.pos;
            if (pos) {
                creep.moveTo(pos, { visualizePathStyle: { stroke: '#0000ff' } })
            }
            return true;
        }
    }
    // const exits = creep.room.find(FIND_EXIT);
    // if (exits.length && creep.memory.occupation.includes(Trait.SWITCH_ROOM) &&
    //     creep.room.name == creep.memory.homeBase && creep.store.getFreeCapacity() > 0) {
    //     creep.memory.task = Task.SWITCH_ROOM;
    //     // FIXME: select actual exit
    //     console.log(`current room: ${creep.room.name}, exits ${exits[10]}`);
    //     creep.moveTo(exits[10], { visualizePathStyle: { stroke: '#0000ff' } })
    //     return true;
    // }

    return false;
}
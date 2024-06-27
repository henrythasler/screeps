import { Task, nonInterruptableTasks } from "./task";
import { Trait } from "./trait";

// export function check(creep: Creep): Task {
//     if (creep.memory.occupation.includes(Trait.SWITCH_ROOM) && !nonInterruptableTasks.includes(creep.memory.task)) {
//         if (creep.room.name != creep.memory.homeBase) {
//             return Task.RETURN;
//         }
//     }
//     return creep.memory.task;
// }

export function execute(creep: Creep): boolean {
    if (creep.room.name != creep.memory.homeBase && creep.memory.occupation.includes(Trait.SWITCH_ROOM) && creep.store.getFreeCapacity() == 0) {
        creep.memory.task = Task.RETURN;
        const home = Game.rooms[creep.memory.homeBase].find(FIND_FLAGS)[0].pos;
        const res = creep.moveTo(home, { visualizePathStyle: { stroke: '#0000ff' } })
        if(!([OK, ERR_TIRED].includes(res as any))) {
            console.log(`[ERROR] creep.moveTo(${home}) failed: ${res}`);
        }
        return true;
    }
    return false;
}
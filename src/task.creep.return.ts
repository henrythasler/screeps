import { Task, nonInterruptableTasks } from "./task";
import { Trait } from "./trait";

export function check(creep: Creep): Task {
    if (creep.memory.occupation.includes(Trait.SWITCH_ROOM) && !nonInterruptableTasks.includes(creep.memory.task)) {
        if (creep.room.name != creep.memory.homeBase) {
            return Task.RETURN;
        }
    }
    return creep.memory.task;
}

export function execute(creep: Creep): Task {
    if ((creep.room.name != creep.memory.homeBase) && (creep.memory.task == Task.RETURN)) {
        const home = new RoomPosition(34, 25, creep.memory.homeBase);
        let res = creep.moveTo(home, { visualizePathStyle: { stroke: '#0000ff' } })
        if(res != OK) {
            console.log(`[ERROR] creep.moveTo(${home}) failed: ${res}`);
        }
    }
    return creep.memory.task;
}
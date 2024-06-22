import { Task, nonInterruptableTasks } from "./task";
import { Trait } from "./trait";

export function check(creep: Creep): Task {
    if (creep.memory.occupation.includes(Trait.SWITCH_ROOM)) {
        const exits = creep.room.find(FIND_EXIT);
        if ((exits.length > 0) && (nonInterruptableTasks.indexOf(creep.memory.task) < 0)) {
            return Task.SWITCH_ROOM;
        }
    }
    return creep.memory.task;
}

export function execute(creep: Creep): Task {
    if ((creep.room.name == creep.memory.homeBase) && (creep.memory.task == Task.SWITCH_ROOM)) {
        const exits = creep.room.find(FIND_EXIT);
        if (exits.length > 0) {
            console.log(`current room: ${creep.room.name}, exits ${exits[10]}`);
            creep.moveTo(exits[10], { visualizePathStyle: { stroke: '#0000ff' } })
        }
    }
    return creep.memory.task;
}
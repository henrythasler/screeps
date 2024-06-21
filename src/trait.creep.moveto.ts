import { idleTasks, nonInterruptableTasks } from "./trait.global";
import { Task } from "./manager.global";

export function check(creep: Creep): Task {
    const meetingPoints = creep.room.find(FIND_FLAGS, { filter: (flag) => { return (flag.name == "Rest"); } });
    if ((meetingPoints.length > 0) && (nonInterruptableTasks.indexOf(creep.memory.task) < 0)) {
        return Task.MOVETO;
    }
    return creep.memory.task;
}

export function execute(creep: Creep): Task {
    const meetingPoints = creep.room.find(FIND_FLAGS, { filter: (flag) => { return (flag.name == "Rest"); } });    
    if ((creep.memory.task == Task.MOVETO) && (meetingPoints.length > 0)) {
        creep.moveTo(meetingPoints[0], { visualizePathStyle: { stroke: '#00ff00' } })
    }
    return creep.memory.task;
}
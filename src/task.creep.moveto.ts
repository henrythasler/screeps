import { Task, nonInterruptableTasks } from "./task";

// export function check(creep: Creep): Task {
//     const meetingPoints = creep.room.find(FIND_FLAGS, { filter: (flag) => { return (flag.name == "Rest"); } });
//     if (meetingPoints.length) {
//         return Task.MOVETO;
//     }
//     return creep.memory.task;
// }

export function execute(creep: Creep): boolean {
    const meetingPoints = creep.room.find(FIND_FLAGS, { filter: (flag) => { return (flag.name == "Rest"); } });
    if (meetingPoints.length) {
        creep.memory.task = Task.MOVETO;
        creep.moveTo(meetingPoints[0], { visualizePathStyle: { stroke: '#00ff00' } });
        return true;
    }
    return false;
}
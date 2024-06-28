import { log, Loglevel } from "./debug";
import { Trait } from "./trait";
import { Task, nonInterruptableTasks } from "./task";

// export function check(creep: Creep): Task {
//     const meetingPoints = creep.room.find(FIND_FLAGS, { filter: (flag) => { return (flag.name == "Rest"); } });
//     if (meetingPoints.length) {
//         return Task.MOVETO;
//     }
//     return creep.memory.task;
// }

export function execute(creep: Creep, pos: RoomPosition): boolean {
    if (JSON.stringify(creep.pos) != JSON.stringify(pos)) {
        creep.memory.task = Task.MOVETO;
        const res = creep.moveTo(pos, { visualizePathStyle: { stroke: '#00ff00' } });
        if (res != OK) {
            log(`[${creep.room.name}][${creep.name}] moveto(${pos}) failed: ${res}`, Loglevel.ERROR);
        }
        return true;
    }
    // const meetingPoints = creep.room.find(FIND_FLAGS, { filter: (flag) => { return (flag.name == "Rest"); } });
    // if (meetingPoints.length) {
    //     creep.memory.task = Task.MOVETO;
    //     creep.moveTo(meetingPoints[0], { visualizePathStyle: { stroke: '#00ff00' } });
    //     return true;
    // }
    return false;
}
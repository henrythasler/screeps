import { Task, sayTask } from "./task";
import * as defend from "./task.creep.defend";

export function run(creep: Creep) {
    const previousTask = creep.memory.task;

    let match = defend.execute(creep);
    if(!match) creep.memory.task = Task.IDLE;

    // tell about the new task
    if (creep.memory.task != previousTask) {
        sayTask(creep);
    }
}
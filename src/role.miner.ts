import { Task, sayTask } from "./task";
import * as mine from "./task.creep.mine";
import * as deposit from "./task.structure.store.other";

export function run(creep: Creep) {
    const previousTask = creep.memory.task;

    let match = mine.execute(creep);
    if(!match) match = deposit.execute(creep);
    if(!match) creep.memory.task = Task.IDLE;

    // tell about the new task
    if (creep.memory.task != previousTask) {
        sayTask(creep);
    }
}
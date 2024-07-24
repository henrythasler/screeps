import { Loglevel, log } from "./debug";
import { Task, sayTask } from "./task";
import * as harvest from "./task.creep.harvest";
import * as deposit from "./task.structure.store.other";
import * as renew from "./task.creep.renew";

export function run(creep: Creep) {
    const previousTask = creep.memory.task;

    let match = harvest.execute(creep);
    if(!match) match = deposit.execute(creep, 7, true);
    if(!match) creep.memory.task = Task.IDLE;

    // tell about the new task
    if (creep.memory.task != previousTask) {
        sayTask(creep);
    }
}
import { Loglevel, log } from "./debug";
import { Task, sayTask } from "./task";
import * as harvest from "./task.creep.harvest";
import * as structureStore from "./task.structure.store";
import * as renew from "./task.creep.renew";

export function run(creep: Creep) {
    const previousTask = creep.memory.task;

    let match = harvest.execute(creep);
    if(!match) match = renew.execute(creep);
    if(!match) match = structureStore.execute(creep);
    if(!match) creep.memory.task = Task.IDLE;

    // tell about the new task
    if (creep.memory.task != previousTask) {
        sayTask(creep);
    }
}
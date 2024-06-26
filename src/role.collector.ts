import { Loglevel, log } from "./debug";
import { Task, nonInterruptableTasks, sayTask } from "./task";
import * as charge from "./task.creep.charge";
import * as moveto from "./task.creep.moveto";
import * as switchRoom from "./task.creep.switchRoom";
import * as returnHome from "./task.creep.return";
import * as structureStore from "./task.structure.store";
import * as renew from "./task.creep.renew";

export function run(creep: Creep) {
    const previousTask = creep.memory.task;

    // any task that is interruptable can be redefined each tick
    // if (nonInterruptableTasks.indexOf(creep.memory.task) < 0) {
    //     creep.memory.task = Task.IDLE;
    // }

    // check what task this creep should do; any check can overwrite the previous task
    // creep.memory.task = moveto.check(creep);
    // creep.memory.task = switchRoom.check(creep);
    // creep.memory.task = returnHome.check(creep);
    // creep.memory.task = structureStore.check(creep);
    // creep.memory.task = charge.check(creep);    // manage creep charging

    // console.log(`${creep.memory.speciesName}: ${creep.memory.task}`);
    log(`name: ${creep.name}, task: ${creep.memory.task}`, Loglevel.DEBUG);

    let match = charge.execute(creep);
    if(!match) match = renew.execute(creep);
    if(!match) match = structureStore.execute(creep);
    if(!match) match = returnHome.execute(creep);
    if(!match) match = switchRoom.execute(creep);
    if(!match) match = moveto.execute(creep);
    if(!match) creep.memory.task = Task.IDLE;

    // tell about the new task
    if (creep.memory.task != previousTask) {
        sayTask(creep);
    }

    // execute current tasks
    // creep.memory.task = moveto.execute(creep);
    // creep.memory.task = switchRoom.execute(creep);
    // creep.memory.task = returnHome.execute(creep);
    // creep.memory.task = structureStore.execute(creep);
    // creep.memory.task = charge.execute(creep);
}
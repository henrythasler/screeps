import { Task, nonInterruptableTasks, sayTask } from "./task";
import * as charge from "./task.creep.charge";
import * as moveto from "./task.creep.moveto";
import * as switchRoom from "./task.creep.switchRoom";
import * as claimController from "./task.controller.claim";
import * as reserveController from "./task.controller.reserve";
import * as recon from "./task.creep.recon";

export function run(creep: Creep) {
    const previousTask = creep.memory.task;

    // any task that is interruptable can be redefined each tick
    if (nonInterruptableTasks.indexOf(creep.memory.task) < 0) {
        creep.memory.task = Task.IDLE;
    }

    // check what task this creep should do; any check can overwrite the previous task
    // creep.memory.task = recon.check(creep);
    // creep.memory.task = moveto.check(creep);
    // creep.memory.task = switchRoom.check(creep);
    // creep.memory.task = reserveController.check(creep);
    // creep.memory.task = claimController.check(creep);
    // creep.memory.task = charge.check(creep);    // manage creep charging

    // tell about the current task
    if (creep.memory.task != previousTask) {
        sayTask(creep);
    }

    // execute current tasks
    // creep.memory.task = recon.execute(creep);
    // creep.memory.task = moveto.execute(creep);
    // creep.memory.task = switchRoom.execute(creep);
    // creep.memory.task = reserveController.execute(creep);
    // creep.memory.task = claimController.execute(creep);
    // creep.memory.task = charge.execute(creep);
}
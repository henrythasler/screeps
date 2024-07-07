import { Task, sayTask } from "./task";
import * as charge from "./task.creep.charge";
import * as claimController from "./task.controller.claim";
import * as reserveController from "./task.controller.reserve";
import * as recon from "./task.creep.recon";
import * as scout from "./task.creep.scout";
import * as renew from "./task.creep.renew";
import * as returnHome from "./task.creep.home";

export function run(creep: Creep) {
    const previousTask = creep.memory.task;

    let match = recon.execute(creep);   // uses no action
    if(!match) match = charge.execute(creep);
    if(!match) match = renew.execute(creep);
    if(!match) match = claimController.execute(creep);
    if(!match) match = reserveController.execute(creep);
    if(!match) match = scout.execute(creep);
    if(!match) match = returnHome.execute(creep);
    if(!match) creep.memory.task = Task.IDLE;

    // tell about the new task
    if (creep.memory.task != previousTask) {
        sayTask(creep);
    }
}
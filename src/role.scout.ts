import { Task, sayTask } from "./task";
import * as claimController from "./task.controller.claim";
import * as reserveController from "./task.controller.reserve";
import * as recon from "./task.creep.recon";
import * as scout from "./task.creep.scout";
import * as prospect from "./task.creep.prospect";
import { Role } from "./manager.global";
import { Config } from "./config";

export function run(creep: Creep) {
    const previousTask = creep.memory.task;

    recon.execute(creep);   // uses no action

    let match = claimController.execute(creep);
    if(!match) match = reserveController.execute(creep);
    if (!match) match = prospect.execute(creep, Config.creeps.get(Role.COLLECTOR)?.maxHops, 1);
    if(!match) match = scout.execute(creep);
    if(!match) creep.memory.task = Task.IDLE;

    // tell about the new task
    if (creep.memory.task != previousTask) {
        sayTask(creep);
    }
}
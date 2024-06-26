import { log } from "./debug";
import { Task, nonInterruptableTasks, idleTasks, sayTask } from "./task";
import { EnergyLocation } from "./manager.global";
import * as charge from "./task.creep.charge";
import * as moveto from "./task.creep.moveto";
import * as structureCharge from "./task.structure.charge";
import * as structureBuild from "./task.structure.build";
import * as controllerCharge from "./task.controller.charge";
import * as controllerRefresh from "./task.controller.refresh";
import * as structureStore from "./task.structure.store";
import * as structureRepair from "./task.structure.repair";

export function run(creep: Creep) {
    const previousTask = creep.memory.task;

    // any task that is interruptable can be redefined each tick
    // if (!nonInterruptableTasks.includes(creep.memory.task)) {
    //     creep.memory.task = Task.IDLE;
    // }

    // check what task this creep should do; any check can overwrite the previous task
    // creep.memory.task = moveto.check(creep);
    // creep.memory.task = structureStore.check(creep);
    // creep.memory.task = controllerCharge.check(creep);  // any controller need charging
    // creep.memory.task = structureBuild.check(creep);    // check for construction sites
    // creep.memory.task = structureRepair.check(creep);
    // creep.memory.task = structureCharge.check(creep);   // check for structures that need recharging
    // creep.memory.task = controllerRefresh.check(creep);
    // creep.memory.task = charge.check(creep);    // manage creep charging

    // console.log(`${creep.memory.speciesName}: ${creep.memory.task}`)

    // execute current tasks, order also defines priority where the first is the most important
    let match = charge.execute(creep);
    if(!match) match = controllerRefresh.execute(creep);
    if(!match) match = structureCharge.execute(creep);
    if(!match) match = structureRepair.execute(creep);
    if(!match) match = structureBuild.execute(creep);
    if(!match) match = controllerCharge.execute(creep);
    if(!match) match = structureStore.execute(creep);
    if(!match) match = moveto.execute(creep);
    if(!match) creep.memory.task = Task.IDLE;

    // tell about the new task
    if (creep.memory.task != previousTask) {
        sayTask(creep);
    }

    if(idleTasks.includes(creep.memory.task)) {
        creep.memory.lastChargeSource = EnergyLocation.SOURCE;
    }
}
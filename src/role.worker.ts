import { Loglevel, log } from "./debug";
import { Task, idleTasks, sayTask } from "./task";
import { EnergyLocation } from "./manager.global";
import * as charge from "./task.creep.charge";
import * as structureCharge from "./task.structure.charge";
import * as structureBuild from "./task.structure.build";
import * as controllerUpgrade from "./task.controller.upgrade";
import * as controllerRefresh from "./task.controller.refresh";
import * as structureStore from "./task.structure.store";
import * as structureRepair from "./task.structure.repair";
import * as renew from "./task.creep.renew";

export function run(creep: Creep) {
    const previousTask = creep.memory.task;

    // execute current tasks, order also defines priority where the first is the most important
    let match = charge.execute(creep);
    if(!match) match = controllerRefresh.execute(creep);
    if(!match) match = renew.execute(creep);
    if(!match) match = structureCharge.execute(creep);
    if(!match) match = structureRepair.execute(creep);
    if(!match) match = structureBuild.execute(creep);
    if(!match) match = controllerUpgrade.execute(creep);
    if(!match) match = structureStore.execute(creep);
    if(!match) creep.memory.task = Task.IDLE;

    // tell about the new task
    if (creep.memory.task != previousTask) {
        sayTask(creep);
    }

    if(idleTasks.includes(creep.memory.task)) {
        creep.memory.lastChargeSource = EnergyLocation.OTHER;
        // creep.memory.lastEnergyDeposit = EnergyLocation.OTHER;
    }
}
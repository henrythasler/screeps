import { log } from "./debug";
import { Task, nonInterruptableTasks, idleTasks } from "./task";
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
    if (nonInterruptableTasks.indexOf(creep.memory.task) < 0) {
        creep.memory.task = Task.IDLE;
    }

    // check what task this creep should do; any check can overwrite the previous task
    creep.memory.task = moveto.check(creep);
    creep.memory.task = structureStore.check(creep);
    creep.memory.task = controllerCharge.check(creep);  // any controller need charging
    creep.memory.task = structureBuild.check(creep);    // check for construction sites
    creep.memory.task = structureRepair.check(creep);
    creep.memory.task = structureCharge.check(creep);   // check for structures that need recharging
    creep.memory.task = controllerRefresh.check(creep);
    creep.memory.task = charge.check(creep);    // manage creep charging

    // tell about the current task
    if (creep.memory.task != previousTask) {
        switch (creep.memory.task) {
            case Task.CHARGE: creep.say('🪫'); break;
            case Task.MOVETO: creep.say('👣'); break;
            case Task.CHARGE_STRUCTURE: creep.say('⚡'); break;
            case Task.CHARGE_CONTROLLER: creep.say('⬆️'); break;
            case Task.REFRESH_CONTROLLER: creep.say('🚿'); break;
            case Task.BUILD_STRUCTURE: creep.say('🔨'); break;
            case Task.STORE_ENERGY: creep.say('🔋'); break;
            case Task.REPAIR_STRUCTURE: creep.say('🔧'); break;
            default: creep.say('💤');
        }
    }

    if(idleTasks.includes(creep.memory.task)) {
        creep.memory.lastChargeSource = EnergyLocation.SOURCE;
    }

    // console.log(`${creep.memory.speciesName}: ${creep.memory.task}`)

    // execute current tasks
    creep.memory.task = charge.execute(creep);
    creep.memory.task = structureCharge.execute(creep);
    creep.memory.task = controllerRefresh.execute(creep);
    creep.memory.task = structureRepair.execute(creep);
    creep.memory.task = structureBuild.execute(creep);
    creep.memory.task = controllerCharge.execute(creep);
    creep.memory.task = structureStore.execute(creep);
    creep.memory.task = moveto.execute(creep);
}
import { Loglevel, log } from "./debug";
import { Task, sayTask } from "./task";
import * as charge from "./task.creep.charge";
import * as switchRoom from "./task.creep.switchRoom";
import * as structureBuild from "./task.structure.build";
import * as returnHome from "./task.creep.return";
import * as updateRoom from "./task.room.update";
import * as structureStore from "./task.structure.store";
import * as renew from "./task.creep.renew";
import * as controllerRefresh from "./task.controller.refresh";
import * as structureCharge from "./task.structure.charge";
import * as controllerUpgrade from "./task.controller.upgrade";
import * as gather from "./task.creep.gather";
import * as harvest from "./task.creep.harvest";
import * as prospect from "./task.creep.prospect";
import { Trait } from "./trait";
import { Config } from "./config";
import { Role } from "./manager.global";

export function run(creep: Creep) {
    const previousTask = creep.memory.task;

    // always update roomInfo
    updateRoom.execute(creep);

    let match = gather.execute(creep);
    if (!match) match = harvest.execute(creep);
    if (!match) match = controllerRefresh.execute(creep);
    // if(!match) match = structureCharge.execute(creep);
    if (!match) match = structureStore.execute(creep);
    if (!match) match = structureBuild.execute(creep);
    if (!match) match = controllerUpgrade.execute(creep);
    if (!match) match = returnHome.execute(creep);
    if (!match) match = prospect.execute(creep, Config.creeps.get(Role.COLLECTOR)?.maxHops);
    if (!match) match = returnHome.execute(creep, true);
    if (!match) creep.memory.task = Task.IDLE;

    // tell about the new task
    if (creep.memory.task != previousTask) {
        sayTask(creep);
    }
}
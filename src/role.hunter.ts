import { Config } from "./config";
import { log } from "./debug";
import { Role } from "./manager.global";
import { Task, sayTask } from "./task";
import * as attack from "./task.creep.attack";
import * as hunt from "./task.creep.hunt";
import * as returnHome from "./task.creep.return";
import * as updateRoom from "./task.room.update";

export function run(creep: Creep) {
    const previousTask = creep.memory.task;

    // always update roomInfo
    updateRoom.execute(creep);

    let match = attack.execute(creep);
    if (!match) match = hunt.execute(creep, Config.creeps.get(Role.HUNTER)?.maxHops);
    if (!match) match = returnHome.execute(creep, true);
    if(!match) creep.memory.task = Task.IDLE;

    // tell about the new task
    if (creep.memory.task != previousTask) {
        sayTask(creep);
    }
}
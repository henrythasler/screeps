import { Task } from "./manager.global";
import { nonInterruptableTasks } from "./trait.global";
import * as charge from "./trait.creep.charge";
import * as moveto from "./trait.creep.moveto";
import * as scoutRoom from "./trait.creep.scoutRoom";
import * as claimController from "./trait.controller.claim";

export function run(creep: Creep) {
    const previousTask = creep.memory.task;

    // any task that is interruptable can be redefined each tick
    if (nonInterruptableTasks.indexOf(creep.memory.task) < 0) {
        creep.memory.task = Task.IDLE;
    }

    // check what task this creep should do; any check can overwrite the previous task
    creep.memory.task = moveto.check(creep);
    creep.memory.task = scoutRoom.check(creep);
    creep.memory.task = claimController.check(creep);
    creep.memory.task = charge.check(creep);    // manage creep charging

    // tell about the current task
    if (creep.memory.task != previousTask) {
        switch (creep.memory.task) {
            case Task.CHARGE: creep.say('🪫'); break;
            case Task.SCOUT: creep.say('🔭'); break;
            case Task.CONTROLLER_CLAIM: creep.say('🚩'); break;
            case Task.MOVETO: creep.say('👣'); break;
            default: creep.say('💤');
        }
    }

    // execute current tasks
    creep.memory.task = moveto.execute(creep);
    creep.memory.task = scoutRoom.execute(creep);
    creep.memory.task = claimController.execute(creep);
    creep.memory.task = charge.execute(creep);
}
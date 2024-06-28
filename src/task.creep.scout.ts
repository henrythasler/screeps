import { Task, nonInterruptableTasks, idleTasks } from "./task";
import { EnergyLocation } from "./manager.global";
import { Trait } from "./trait";
import { Loglevel, log } from "./debug";

export function execute(creep: Creep): boolean {
    if (creep.memory.occupation.includes(Trait.SCOUT_ROOMS)) {
        
    }
    return false;
}
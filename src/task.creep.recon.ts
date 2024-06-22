import { Task, nonInterruptableTasks, idleTasks } from "./task";
import { EnergyLocation } from "./manager.global";
import { Trait } from "./trait";

export function check(creep: Creep): Task {
    if(creep.memory.occupation.includes(Trait.RECON)) {
        const sources: Source[] = creep.room.find(FIND_SOURCES) as Source[];                
        // Memory.sources.push(source);

        const memory: string[] = Memory.sources ? Memory.sources : [];
        for (const source of sources) {        
            if(!memory.includes(source.id)) {
                console.log(`Found new source ${source.id} in room ${creep.room.name}`);
                memory.push(source.id);
            }
        }
        Memory.sources = memory;
    }
    return creep.memory.task;
}

export function execute(creep: Creep): Task {
    return creep.memory.task;
}
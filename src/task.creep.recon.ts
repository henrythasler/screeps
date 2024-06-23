import { Task, nonInterruptableTasks, idleTasks } from "./task";
import { EnergyLocation } from "./manager.global";
import { Trait } from "./trait";

export function check(creep: Creep): Task {
    if(creep.memory.occupation.includes(Trait.RECON_ROOM)) {
        const sources: Source[] = creep.room.find(FIND_SOURCES) as Source[];                

        if(Memory.sources == undefined) {
            Memory.sources = [];
        }
        for (const source of sources) {        
            if(!Memory.sources.includes(source.id)) {
                console.log(`found ${source}`);
                Memory.sources.push(source.id);
            }
        }
    }
    return creep.memory.task;
}

export function execute(creep: Creep): Task {
    return creep.memory.task;
}
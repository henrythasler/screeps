import { Task, nonInterruptableTasks, idleTasks } from "./task";
import { EnergyLocation } from "./manager.global";
import { Trait } from "./trait";
import { Loglevel, log } from "./debug";

export function execute(creep: Creep): boolean {
    if (creep.memory.occupation.includes(Trait.RECON_ROOM)) {
        const sources: Source[] = creep.room.find(FIND_SOURCES) as Source[];
        Memory.knownSources = Memory.knownSources ?? [];

        for (const source of sources) {
            if (!Memory.knownSources.includes(source.id)) {
                Memory.knownSources.push(source.id);
                log(`[${creep.room.name}][recon] found new source: ${source}`, Loglevel.INFO);
            }
        }
    }
    return false;
}
import { Task, nonInterruptableTasks, idleTasks } from "./task";
import { EnergyLocation } from "./manager.global";
import { Trait } from "./trait";
import { Loglevel, log } from "./debug";

export function execute(creep: Creep): boolean {

    if (creep.memory.occupation.includes(Trait.SCOUT_ROOMS)) {

        if (creep.memory.task != Task.SWITCH_ROOM || creep.memory.targetLocation?.roomName != creep.room.name) {
            // pick a random direction
            const type = ([FIND_EXIT_TOP, FIND_EXIT_RIGHT, FIND_EXIT_BOTTOM, FIND_EXIT_LEFT])[(Math.floor(Math.random() * 4))];
            const exits = creep.room.find(type);

            creep.memory.targetLocation = exits.find( (exit) => {
                return !PathFinder.search(creep.pos, exit).incomplete;
            });
        }

        if(creep.memory.targetLocation) {
            creep.memory.task = Task.SWITCH_ROOM;
            const target = creep.memory.targetLocation as RoomPosition;
            const res = creep.moveTo(target.x, target.y, { visualizePathStyle: { stroke: '#0000ff' } });
            if (res != OK) {
                log(`[${creep.room.name}][${creep.name}] moveto(${creep.memory.targetLocation.x}, ${creep.memory.targetLocation.y}) failed: ${res}`, Loglevel.ERROR);
            }            
            return true;
        }
    }
    return false;
}
import { Task } from "./task";
import { Trait } from "./trait";

export function execute(creep: Creep): boolean {
/*    
    if (creep.memory.occupation.includes(Trait.SWITCH_ROOM) && creep.store.getFreeCapacity() == 0 || creep.room.find(FIND_HOSTILE_CREEPS).length > 0) {
        const home = Game.rooms[creep.memory.homeBase].find(FIND_MY_SPAWNS)[0].pos;
        const res = creep.moveTo(home, { visualizePathStyle: { stroke: '#0000ff' } })
        if (([OK, ERR_TIRED].includes(res as any))) {
            creep.memory.task = Task.RETURN;
            return true;
        }
        else {
            console.log(`[ERROR] creep.moveTo(${home}) failed: ${res}`);
        }
    }
*/        
    return false;
}
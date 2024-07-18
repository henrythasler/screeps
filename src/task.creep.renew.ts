import { Config } from "./config";
import { Task } from "./task";
import { Trait } from "./trait";

export function execute(creep: Creep): boolean {
/*    
    const threshold = (creep.memory.task == Task.RENEW) ? Config.creepRenewMax : Config.creepRenewThreshold;
    if (creep.memory.occupation.includes(Trait.RENEW_CREEP) && !creep.spawning && creep.ticksToLive! < threshold) {

        // try renew at local spawn first
        const availableSpawns = creep.room.find(FIND_MY_SPAWNS, {
            filter: (structure) => {
                return structure.store.getFreeCapacity(RESOURCE_ENERGY) < structure.store.getCapacity(RESOURCE_ENERGY) * Config.spawnRenewMinEnergy;
            }
        });

        if (availableSpawns.length) {
            // availableSpawns.sort((a: StructureSpawn, b: StructureSpawn): number => {
            //     return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
            // });

            const res = creep.moveTo(availableSpawns[0], { visualizePathStyle: { stroke: '#007f00' } })
            creep.memory.task = Task.RENEW;
            return true;
        }

        if (creep.room.name != creep.memory.homeBase && creep.memory.occupation.includes(Trait.SWITCH_ROOM)) {
            const home = Game.rooms[creep.memory.homeBase]?.find(FIND_MY_SPAWNS)[0];
            if (home) {
                const res = creep.moveTo(home, { visualizePathStyle: { stroke: '#0000ff' } })
                creep.memory.task = Task.RENEW;
                return true;
            }
        }
    }
*/        
    return false;
}
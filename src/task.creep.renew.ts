import { Config } from "./config";
import { Task, nonInterruptableTasks } from "./task";
import { Trait } from "./trait";

export function execute(creep: Creep): boolean {
    const availableSpawns = creep.room.find(FIND_MY_SPAWNS, {
        filter: (structure) => {
            return structure.store.getFreeCapacity(RESOURCE_ENERGY) < structure.store.getCapacity(RESOURCE_ENERGY) * Config.spawnRenewMinEnergy;
        }
    });
    const threshold = (creep.memory.task == Task.RENEW) ? Config.creepRenewMax : Config.creepRenewThreshold;

    if (availableSpawns.length && creep.memory.occupation.includes(Trait.RENEW_CREEP) &&
        !creep.spawning && creep.ticksToLive! < threshold) {
        creep.memory.task = Task.RENEW;

        availableSpawns.sort((a: StructureSpawn, b: StructureSpawn): number => {
            return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
        });

        const res = creep.moveTo(availableSpawns[0], { visualizePathStyle: { stroke: '#007f00' } })
        return true;
    }
    return false;
}
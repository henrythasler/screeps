import { log } from "./debug";
import { actionAllowed } from "./helper";
import { Task } from "./task";
import { Trait } from "./trait";

export function execute(creep: Creep): boolean {
    if (creep.memory.occupation.includes(Trait.ATTACK_HOSTILE) && actionAllowed(creep, creep.room.name)) {
        const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);

        hostiles.sort((a: Creep, b: Creep): number => {
            return (a.hits - b.hits);
        });
        const hostile = hostiles[0];

        if(hostile) {
            const res = creep.attack(hostile);
            if (res == ERR_NOT_IN_RANGE) {
                creep.moveTo(hostile, { visualizePathStyle: { stroke: '#000000' } });
            }
            creep.memory.task = Task.ATTACK_HOSTILE;
            return true;
        }
    }
    return false;
}
import { Config } from "./config";
import { Task } from "./task";
import { Trait } from "./trait";

const repairFilter: StructureConstant[] = [
    STRUCTURE_EXTENSION,
    STRUCTURE_SPAWN,
    // STRUCTURE_RAMPART,
    // STRUCTURE_WALL,
    STRUCTURE_TOWER,
];

// FIXME: add hysteresis
export function execute(creep: Creep): boolean {
/*    
    const structuresToRepair = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return repairFilter.includes(structure.structureType) &&
                (structure.hits < structure.hitsMax * Config.structureWorkerRepairThreshold);
        }
    });
    if (structuresToRepair.length && creep.memory.occupation.includes(Trait.REPAIR_STRUCTURE)) {
        creep.memory.task = Task.REPAIR_STRUCTURE;
        structuresToRepair.sort((a: AnyStructure, b: AnyStructure): number => {
            return (a.hits - b.hits);
        });
        // structuresToRepair.sort((a: AnyStructure, b: AnyStructure): number => {
        //     return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
        // });

        if (creep.repair(structuresToRepair[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(structuresToRepair[0], { visualizePathStyle: { stroke: '#00ff00' } });
        }
        return true;
    }
*/
    return false;
}
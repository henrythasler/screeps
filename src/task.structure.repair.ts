import { Task, nonInterruptableTasks } from "./task";
import { Trait } from "./trait";

const repairFilter: StructureConstant[] = [
    STRUCTURE_EXTENSION,
    STRUCTURE_SPAWN,
    // STRUCTURE_RAMPART,
    STRUCTURE_TOWER,
];

export function check(creep: Creep): Task {
    if (creep.memory.occupation.includes(Trait.REPAIR_STRUCTURE)) {
        const structuresToRepair: AnyStructure[] = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return repairFilter.includes(structure.structureType) &&
                    (structure.hits / structure.hitsMax < 0.2);
            }
        });
        if ((structuresToRepair.length > 0) && (nonInterruptableTasks.indexOf(creep.memory.task) < 0)) {
            return Task.REPAIR_STRUCTURE;
        }
    }
    return creep.memory.task;
}

// FIXME: add hysteresis
export function execute(creep: Creep): Task {
    if (creep.memory.task == Task.REPAIR_STRUCTURE) {
        const structuresToRepair = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return repairFilter.includes(structure.structureType) &&
                    (structure.hits / structure.hitsMax < 0.2);
            }
        });
        if (structuresToRepair.length > 0) {
            structuresToRepair.sort((a: AnyStructure, b: AnyStructure): number => {
                return (a.hits - b.hits);
            });
            // structuresToRepair.sort((a: AnyStructure, b: AnyStructure): number => {
            //     return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
            // });

            if (creep.repair(structuresToRepair[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(structuresToRepair[0], { visualizePathStyle: { stroke: '#00ff00' } });
            }
        }
    }
    return creep.memory.task;
}
import { EnergyLocation } from "./manager.global";
import { log, Loglevel } from "./debug";
import { Task } from "./task";
import { Trait } from "./trait";
import { actionAllowed } from "./helper";

export function execute(creep: Creep): boolean {
    const structuresToCharge: AnyStructure[] = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION ||
                structure.structureType == STRUCTURE_SPAWN ||
                structure.structureType == STRUCTURE_TOWER) &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    });

    if (structuresToCharge.length && creep.memory.occupation.includes(Trait.RECHARGE_STRUCTURE) && creep.store[RESOURCE_ENERGY] > 0 && actionAllowed(creep, creep.room.name)) {
        creep.memory.task = Task.CHARGE_STRUCTURE;
        structuresToCharge.sort((a: AnyStructure, b: AnyStructure): number => {
            if(a.structureType == STRUCTURE_SPAWN && b.structureType != STRUCTURE_SPAWN) return -1;
            if(a.structureType != STRUCTURE_SPAWN && b.structureType == STRUCTURE_SPAWN) return 1;

            if(a.structureType == STRUCTURE_EXTENSION && b.structureType != STRUCTURE_EXTENSION) return -1;
            if(a.structureType != STRUCTURE_EXTENSION && b.structureType == STRUCTURE_EXTENSION) return 1;

            return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
        });
        
        const res = creep.transfer(structuresToCharge[0]!, RESOURCE_ENERGY);
        if(res == OK) {
            creep.memory.lastEnergyDeposit = EnergyLocation.OTHER;
        }
        else if (res == ERR_NOT_IN_RANGE) {
            creep.moveTo(structuresToCharge[0]!, { visualizePathStyle: { stroke: '#00ff00' } });
        }
        else {
            log(`[${creep.room.name}][${creep.name}] build(${structuresToCharge[0]}) failed: ${res}`, Loglevel.ERROR);
        }
        return true;
    }
    return false;
}
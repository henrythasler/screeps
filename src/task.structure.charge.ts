import { Task } from "./task";
import { EnergyLocation } from "./manager.global";
import { Trait } from "./trait";
import { isInHomeBase, mergeArrays, removeEntries } from "./helper";
import { categorizeCreepLocation, Location } from "./location";
import { zoo } from "./zoo";
import { Config } from "./config";
import { log, Loglevel } from "./debug";

export function execute(creep: Creep): boolean {
    const species = zoo.get(creep.memory.role)?.get(creep.memory.speciesName);
    if (species) {
        const location = categorizeCreepLocation(creep);

        // derive available traits for the current room and general traits
        const traits = removeEntries(mergeArrays(species.traits.get(location), species.traits.get(Location.EVERYWHERE)), species.traits.get(Location.NOWHERE));

        if (!traits.includes(Trait.RECHARGE_STRUCTURE)) {
            return false;
        }

        // const structuresToCharge: AnyStructure[] = creep.room.find(FIND_STRUCTURES, {
        //     filter: (structure) => {
        //         return (structure.structureType == STRUCTURE_EXTENSION ||
        //             structure.structureType == STRUCTURE_SPAWN ||
        //             structure.structureType == STRUCTURE_TOWER) &&
        //             structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        //     }
        // });

        // const structuresToCharge = creep

        // if(creep.memory.activeRequisitions.length) {
        //     const structuresToCharge = 
        // }


        if (creep.store[RESOURCE_ENERGY] > 0) {

            if (!creep.memory.activeRequisitions.length) {
                let availableEnergy = creep.store[RESOURCE_ENERGY];
                while (availableEnergy > 0 && Memory.pendingRequisitions.length) {
                    const requisition = Memory.pendingRequisitions.at(0);
                    if (requisition) {
                        creep.memory.activeRequisitions.push(requisition);
                        // Memory.pendingRequisitions.at(0)!.amount -= availableEnergy;
                        availableEnergy = availableEnergy - requisition.amount;
                    }
                }
            }
            log(`[${creep.name}] activeRequisitions: ${JSON.stringify(creep.memory.activeRequisitions)}`)

            const structuresToCharge: (StructureExtension | StructureSpawn)[] = [];
            creep.memory.activeRequisitions.forEach((requisition) => {
                const gameObject = Game.getObjectById(requisition.requesterId);
                if (gameObject) {
                    structuresToCharge.push(gameObject);
                }
            })

            if (structuresToCharge.length) {
                structuresToCharge.sort((a: AnyStructure, b: AnyStructure): number => {
                    if (a.structureType == STRUCTURE_SPAWN && b.structureType != STRUCTURE_SPAWN) return -1;
                    if (a.structureType != STRUCTURE_SPAWN && b.structureType == STRUCTURE_SPAWN) return 1;

                    if (a.structureType == STRUCTURE_EXTENSION && b.structureType != STRUCTURE_EXTENSION) return -1;
                    if (a.structureType != STRUCTURE_EXTENSION && b.structureType == STRUCTURE_EXTENSION) return 1;

                    return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
                });

                const currentStructure = structuresToCharge[0];
                const res = creep.transfer(currentStructure, RESOURCE_ENERGY);
                if (res == OK) {
                    creep.memory.lastEnergyDeposit = EnergyLocation.OTHER;
                    if(currentStructure?.store.getFreeCapacity() == 0) {
                        creep.memory.activeRequisitions = creep.memory.activeRequisitions.filter((req) => req.requesterId != currentStructure.id);
                    }
                }
                else if (res == ERR_NOT_IN_RANGE) {
                    creep.moveTo(currentStructure, { visualizePathStyle: Config.visualizePathStyle.get(Task.CHARGE_STRUCTURE) });
                }
                else if (res == ERR_FULL) {
                    creep.memory.activeRequisitions = creep.memory.activeRequisitions.filter((req) => req.requesterId != currentStructure.id);
                    return false;
                }
                else {
                    log(`[${creep.room.name}][${creep.name}] transfer(${currentStructure}) failed: ${res}`, Loglevel.ERROR);
                    return false;
                }
                creep.memory.task = Task.CHARGE_STRUCTURE;
                return true;
            }
        }
    }

    /*    
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
    */
    return false;
}
import { Task } from "./task";
import { EnergyLocation, Requisition } from "./manager.global";
import { Trait } from "./trait";
import { deepCopy, isInHomeBase, mergeArrays, removeEntries } from "./helper";
import { categorizeCreepLocation, Location } from "./location";
import { zoo } from "./zoo";
import { Config } from "./config";
import { log, Loglevel } from "./debug";

export function execute(creep: Creep): boolean {
    const species = zoo.get(creep.memory.role)?.get(creep.memory.speciesName);
    if (species) {
        const location = categorizeCreepLocation(creep.room, creep.memory.homeBase);

        // derive available traits for the current room and general traits
        const traits = removeEntries(mergeArrays(species.traits.get(location), species.traits.get(Location.EVERYWHERE)), species.traits.get(Location.NOWHERE));

        if (!traits.includes(Trait.RECHARGE_STRUCTURE) || creep.store[RESOURCE_ENERGY] == 0) {
            return false;
        }

        let availableEnergy = creep.store[RESOURCE_ENERGY];
        for(let i=0; i<Memory.pendingRequisitions.length; i++) {
            if(availableEnergy <= 0 || Memory.pendingRequisitions.length == 0) {
                break;
            }
        // while (availableEnergy > 0 && Memory.pendingRequisitions.length) {
            const requisition = Memory.pendingRequisitions[i];
            // FIXME: check room name with Trait definition
            if (requisition && requisition.position.roomName == creep.memory.homeBase) {
                const requisitionCopy: Requisition = deepCopy(requisition);
                const requisitionAmount = requisition.amount;
                requisitionCopy.amount = Math.min(requisitionAmount, availableEnergy);
                // enough energy to fulfil the requisition
                if (availableEnergy >= requisitionAmount) {
                    availableEnergy -= requisitionAmount;
                    // log(`removing`)
                    Memory.pendingRequisitions.shift();
                }
                // requisition can only be fulfilled partially
                else {
                    requisition.amount -= availableEnergy;
                    availableEnergy -= requisitionAmount;
                    // log(`reducing [${creep.room.name}] pendingRequisitions: ${JSON.stringify(Memory.pendingRequisitions)}`)
                }
                creep.memory.activeRequisitions.push(requisitionCopy);
            }
        }
        const structuresToCharge: (StructureExtension | StructureSpawn | StructureTower)[] = [];
        creep.memory.activeRequisitions = creep.memory.activeRequisitions.filter((requisition) => {
            const gameObject = Game.getObjectById(requisition.requesterId);
            if (!gameObject) {
                return false;
            }
            structuresToCharge.push(gameObject);
            return true;
        });

        structuresToCharge.sort((a: AnyStructure, b: AnyStructure): number => {
            if (a.structureType == STRUCTURE_SPAWN && b.structureType != STRUCTURE_SPAWN) return -1;
            if (a.structureType != STRUCTURE_SPAWN && b.structureType == STRUCTURE_SPAWN) return 1;

            if (a.structureType == STRUCTURE_EXTENSION && b.structureType != STRUCTURE_EXTENSION) return -1;
            if (a.structureType != STRUCTURE_EXTENSION && b.structureType == STRUCTURE_EXTENSION) return 1;

            return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
        });

        const currentStructure = structuresToCharge[0];
        if (currentStructure) {
            log(`[${creep.name}] activeRequisitions: ${JSON.stringify(creep.memory.activeRequisitions)}`, Loglevel.DEBUG);

            const energyAmount = creep.store[RESOURCE_ENERGY];
            const res = creep.transfer(currentStructure, RESOURCE_ENERGY);
            if (res == OK) {
                creep.memory.lastEnergyDeposit = EnergyLocation.OTHER;
                if (currentStructure?.store.getFreeCapacity(RESOURCE_ENERGY) - energyAmount <= 0) {
                    Memory.requisitionOwner = Memory.requisitionOwner.filter((req) => req != currentStructure.id);
                }
                creep.memory.activeRequisitions = creep.memory.activeRequisitions.filter((req) => req.requesterId != currentStructure.id);
            }
            else if (res == ERR_NOT_IN_RANGE) {
                creep.moveTo(currentStructure, { visualizePathStyle: Config.visualizePathStyle.get(Task.CHARGE_STRUCTURE) });
            }
            else if (res == ERR_FULL) {
                creep.memory.activeRequisitions = creep.memory.activeRequisitions.filter((req) => req.requesterId != currentStructure.id);
                Memory.requisitionOwner = Memory.requisitionOwner.filter((req) => req != currentStructure.id);
            }
            else {
                creep.memory.activeRequisitions = creep.memory.activeRequisitions.filter((req) => req.requesterId != currentStructure.id);
                creep.memory.lastEnergyDeposit = EnergyLocation.OTHER;
                log(`[${creep.room.name}][${creep.name}] transfer(${currentStructure}) failed: ${res}`, Loglevel.ERROR);
                return false;
            }
            creep.memory.task = Task.CHARGE_STRUCTURE;
            return true;
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
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

        let availableEnergy = creep.store[RESOURCE_ENERGY] - creep.memory.activeRequisitions.reduce((total, req) => { return total + ((req.resource == RESOURCE_ENERGY) ? req.amount : 0) }, 0);
        log(`[${creep.name}] availableEnergy: ${availableEnergy}`, Loglevel.DEBUG);
        for (let i = 0; i < Memory.pendingRequisitions.length; i++) {
            if (availableEnergy <= 0 || Memory.pendingRequisitions.length == 0) {
                break;
            }
            const requisition = Memory.pendingRequisitions[i];
            if (requisition && requisition.resource == RESOURCE_ENERGY && requisition.position.roomName == creep.memory.homeBase && requisition.amount > 0) {
                const requisitionCopy: Requisition = deepCopy(requisition);
                requisition.amount = Math.max(requisition.amount - availableEnergy, 0);
                requisitionCopy.amount = Math.min(availableEnergy, requisitionCopy.amount);
                availableEnergy -= requisitionCopy.amount;
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

            const energyAmount = creep.memory.activeRequisitions.find((reqs) => reqs.requesterId == currentStructure.id)?.amount;
            const res = creep.transfer(currentStructure, RESOURCE_ENERGY, energyAmount);
            if (res == OK) {
                creep.memory.lastEnergyDeposit = EnergyLocation.OTHER;
                creep.memory.activeRequisitions = creep.memory.activeRequisitions.filter((req) => req.requesterId != currentStructure.id);
            }
            else if (res == ERR_NOT_IN_RANGE) {
                creep.moveTo(currentStructure, { visualizePathStyle: Config.visualizePathStyle.get(Task.CHARGE_STRUCTURE) });
            }
            else if (res == ERR_FULL) {
                creep.memory.activeRequisitions = creep.memory.activeRequisitions.filter((req) => req.requesterId != currentStructure.id);
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
    return false;
}
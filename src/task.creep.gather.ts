import { Task } from "./task";
import { EnergyLocation, Role } from "./manager.global";
import { Trait } from "./trait";
import { Config } from "./config";
import { Loglevel, log } from "./debug";
import { isNearHostile, mergeArrays, removeEntries } from "./helper";
import { zoo } from "./zoo";
import { categorizeCreepLocation, Location } from "./location";

function gatherEnergy(creep: Creep, sources: (Tombstone | Ruin)[]): boolean {
    sources.sort((a, b): number => {
        return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
    });
    // get stuff or move towards source
    const source = sources[0];
    if (source) {
        // source.pos.getRangeTo(creep.pos) < (source.store[RESOURCE_ENERGY] * Config.tombstoneGatherFactor)

        const res = creep.withdraw(source, Object.keys(source.store)[0] as ResourceConstant);
        if (res == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { visualizePathStyle: Config.visualizePathStyle.get(Task.GATHER) });
        }
        else if (res == OK) {
            creep.memory.lastChargeSource = EnergyLocation.OTHER;
        }
        else {
            log(`[${creep.room.name}][${creep.name}] gather(${sources[0]}) failed: ${res}`, Loglevel.ERROR);
            return false;
        }
        return true;
    }
    return false;
}

function pickupResource(creep: Creep, items: Resource[]): boolean {
    items.sort((a, b): number => {
        return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
    });

    const item = items[0];
    if (item) {
        const res = creep.pickup(item);
        if (res == ERR_NOT_IN_RANGE) {
            creep.moveTo(item, { visualizePathStyle: Config.visualizePathStyle.get(Task.GATHER) });
        }
        else if (res == OK) {
            creep.memory.lastChargeSource = creep.memory.lastChargeSource = EnergyLocation.OTHER;
        }
        else {
            log(`[${creep.room.name}][${creep.name}] pickup(${items[0]}) failed: ${res}`, Loglevel.ERROR);
            return false;
        }
        return true;
    }
    return false;
}

export function execute(creep: Creep): boolean {
    const species = zoo.get(creep.memory.role)?.get(creep.memory.speciesName);
    if (species) {
        const location = categorizeCreepLocation(creep.room, creep.memory.homeBase);

        // derive available traits for the current room and general traits
        const traits = removeEntries(mergeArrays(species.traits.get(location), species.traits.get(Location.EVERYWHERE)), species.traits.get(Location.NOWHERE));

        if (!traits.includes(Trait.GATHER_RESOURCE) || creep.store.getFreeCapacity() == 0 || (creep.store.getUsedCapacity() > 0 && creep.memory.task != Task.GATHER)) {
            return false;
        }

        const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);

        // Tombstones resources
        const tombstones: Tombstone[] = creep.room.find(FIND_TOMBSTONES, {
            filter: (structure) => {
                const storedItems = Object.keys(structure.store).length;
                return !isNearHostile(structure, hostiles) && storedItems > 0;
            }
        });
        if (tombstones.length) {
            if (gatherEnergy(creep, tombstones)) {
                creep.memory.task = Task.GATHER;
                return true;
            }
        }

        // Ruins with resources
        const ruins: Ruin[] = creep.room.find(FIND_RUINS, {
            filter: (structure) => {
                const storedItems = Object.keys(structure.store).length;
                return !isNearHostile(structure, hostiles) && storedItems > 0;
            }
        });
        if (ruins.length) {
            if (gatherEnergy(creep, ruins)) {
                creep.memory.task = Task.GATHER;
                return true;
            }
        }        

        // dropped resources
        const resource: Resource[] = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: (resource) => {
                return !isNearHostile(resource, hostiles) && resource.amount > 10 && resource.pos.getRangeTo(creep.pos) < (resource.resourceType == RESOURCE_ENERGY ? Config.resourcePickupMaxDistance : 50);
            }
        });
        if (resource.length) {
            if (pickupResource(creep, resource)) {
                creep.memory.task = Task.GATHER;
                return true;
            }
        }
    }
    return false;
}
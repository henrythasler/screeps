import { Task } from "./task";
import { EnergyLocation } from "./manager.global";
import { Trait } from "./trait";
import { isInHomeBase, mergeArrays, removeEntries } from "./helper";
import { categorizeCreepLocation, Location } from "./location";
import { zoo } from "./zoo";
import { Config } from "./config";

export function execute(creep: Creep, maxDistance?: number, ignoreLastDeposit: boolean = false): boolean {
    const species = zoo.get(creep.memory.role)?.get(creep.memory.speciesName);
    if (species) {
        const location = categorizeCreepLocation(creep.room, creep.memory.homeBase);

        // derive available traits for the current room and general traits
        const traits = removeEntries(mergeArrays(species.traits.get(location), species.traits.get(Location.EVERYWHERE)), species.traits.get(Location.NOWHERE));

        if (!traits.includes(Trait.STORE_OTHER) || creep.store.getUsedCapacity() == 0) {
            return false;
        }

        const storedResources = (Object.keys(creep.store) as ResourceConstant[]).filter( (res) => {return res != RESOURCE_ENERGY});

        const storageCandidates = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_STORAGE && structure.store.getFreeCapacity() > 0 &&
                    creep.pos.getRangeTo(structure) < (maxDistance ?? 100);
            }
        }) as StructureStorage[];

        const storage = storageCandidates[0];
        const resource = storedResources[0];
        if (storage && resource) {
            // sort by distance
            storageCandidates.sort((a: StructureStorage, b: StructureStorage): number => {
                return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
            });

            const res = creep.transfer(storage, resource);
            if (res == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage, { visualizePathStyle: Config.visualizePathStyle.get(Task.STORE_OTHER) });
            }
            creep.memory.task = Task.STORE_OTHER;
            return true;
        }
    }
    return false;
}

import { Task } from "./task";
import { EnergyLocation, Role } from "./manager.global";
import { Trait } from "./trait";
import { Config } from "./config";
import { Loglevel, log } from "./debug";
import { isNearHostile, mergeArrays, removeEntries } from "./helper";
import { zoo } from "./zoo";
import { categorizeCreepLocation, Location } from "./location";

export function execute(creep: Creep): boolean {
    const species = zoo.get(creep.memory.role)?.get(creep.memory.speciesName);
    if (species) {
        const location = categorizeCreepLocation(creep.room, creep.memory.homeBase);

        // derive available traits for the current room and general traits
        const traits = removeEntries(mergeArrays(species.traits.get(location), species.traits.get(Location.EVERYWHERE)), species.traits.get(Location.NOWHERE));

        if (!traits.includes(Trait.BUILD_STRUCTURE)) {
            return false;
        }

        const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
        const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES, {
            filter: (site) => {
                return !isNearHostile(site, hostiles);
            }
        });
        if (constructionSites.length) {
            // build by creation order (do not sort)
            const res = creep.build(constructionSites[0]!);
            if (res == OK) {
                creep.memory.lastEnergyDeposit = EnergyLocation.OTHER;
            }
            else if (res == ERR_NOT_IN_RANGE) {
                creep.moveTo(constructionSites[0]!, { visualizePathStyle: Config.visualizePathStyle.get(Task.BUILD_STRUCTURE) });
            }
            else if (res != ERR_NOT_ENOUGH_ENERGY) {
                log(`[${creep.room.name}][${creep.name}] build(${constructionSites[0]}) failed: ${res}`, Loglevel.ERROR);
                return false;
            }
            creep.memory.task = Task.BUILD_STRUCTURE;
            return true;
        }
    }
    return false;
}
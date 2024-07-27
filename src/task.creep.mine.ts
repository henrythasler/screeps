import { idleTasks, Task } from "./task";
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

        if (!traits.includes(Trait.MINE_MINERAL) || creep.store.getFreeCapacity() == 0) {
            return false;
        }

        const minerals: Mineral[] = creep.room.find(FIND_MINERALS, {
            filter: (mineral) => {
                return mineral.mineralAmount > 0;
            }
        });

        if (minerals.length) {
            // distribute evenly over available sources beginning with the closest
            minerals.sort((a: Mineral, b: Mineral): number => {
                return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
            });

            const site = minerals[0]!;

            const extractorCandidates = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_EXTRACTOR && structure.pos.isEqualTo(site.pos);
                }
            }) as StructureExtractor[];

            const extractor = extractorCandidates[0];

            if (extractor && extractor.cooldown == 0) {

                // harvest or move towards source
                const res = creep.harvest(site);
                if (res == OK) {
                    creep.memory.lastChargeSource = EnergyLocation.OTHER;
                }
                else if (res == ERR_NOT_IN_RANGE) {
                    creep.moveTo(site, { visualizePathStyle: Config.visualizePathStyle.get(Task.MINE) });
                }
                else if (res != ERR_NOT_ENOUGH_RESOURCES) {
                    log(`[ERROR] mine(${site}): ${res}`)
                    return false;
                }
            }
            creep.memory.task = Task.MINE;
            return true;
        }
    }
    return false;
}
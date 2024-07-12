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
        const location = categorizeCreepLocation(creep);

        // derive available traits for the current room and general traits
        const traits = removeEntries(mergeArrays(species.traits.get(location), species.traits.get(Location.EVERYWHERE)), species.traits.get(Location.NOWHERE));

        if (!traits.includes(Trait.HARVEST_SOURCE)) {
            return false;
        }

        const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
        const sources: Source[] = creep.room.find(FIND_SOURCES, {
            filter: (source) => {
                return !isNearHostile(source, hostiles) && (source.energy > 0 || source.ticksToRegeneration < Config.harvestSourceRegenerationThreshold);
            }
        }) as Source[];

        if (sources.length && creep.store.getFreeCapacity() > 0) {
            let sourceId = 0;
            // distribute evenly over available sources beginning with the closest
            sources.sort((a: Source, b: Source): number => {
                const harvesterAtFirst = creep.room.memory.harvesterPerSource.get(a.id);
                const harvesterAtSecond = creep.room.memory.harvesterPerSource.get(b.id);
                if (harvesterAtFirst && !harvesterAtSecond) {
                    return 1;
                }
                if (!harvesterAtFirst && harvesterAtSecond) {
                    return -1;
                }
                if (harvesterAtFirst && harvesterAtSecond && harvesterAtFirst != harvesterAtSecond) {
                    return harvesterAtFirst - harvesterAtSecond;
                }
                return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
            });

            const source = sources[sourceId]!;
            if (creep.room.memory.harvesterPerSource.has(source.id)) {
                creep.room.memory.harvesterPerSource.set(source.id, creep.room.memory.harvesterPerSource.get(source.id)! + 1);
            }
            else {
                creep.room.memory.harvesterPerSource.set(source.id, 1);
            }

            // harvest or move towards source
            const res = creep.harvest(source);
            if (res == OK) {
                creep.memory.lastChargeSource = EnergyLocation.SOURCE;
            }
            else if (res == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { visualizePathStyle: Config.visualizePathStyle.get(Task.HARVEST) });
            }
            else {
                console.log(`[ERROR] harvest(${source}): ${res}`)
                return false;
            }

            creep.memory.task = Task.HARVEST;
            return true;
        }
    }
    return false;
}
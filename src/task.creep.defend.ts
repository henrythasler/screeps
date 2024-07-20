import { Task } from "./task";
import { EnergyLocation, Role } from "./manager.global";
import { Trait } from "./trait";
import { Config } from "./config";
import { Loglevel, log } from "./debug";
import { filterMap, getRandomMapEntry, getRoomNameByDirection, isNearHostile, isOnBorder, mergeArrays, removeEntries } from "./helper";
import { zoo } from "./zoo";
import { categorizeCreepLocation, Location } from "./location";
import { roomInfoMap } from "./room.info";

export function execute(creep: Creep): boolean {
    const species = zoo.get(creep.memory.role)?.get(creep.memory.speciesName);
    if (species) {
        const location = categorizeCreepLocation(creep.room, creep.memory.homeBase);

        // derive available traits for the current room and general traits
        const traits = removeEntries(mergeArrays(species.traits.get(location), species.traits.get(Location.EVERYWHERE)), species.traits.get(Location.NOWHERE));


        if (!traits.includes(Trait.ATTACK_HOSTILE)) {
            return false;
        }

        const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);

        hostiles.sort((a: Creep, b: Creep): number => {
            return (a.hits - b.hits);
        });
        const hostile = hostiles[0];

        if (hostile) {
            const res = creep.attack(hostile);
            if (res == ERR_NOT_IN_RANGE) {
                creep.moveTo(hostile, { visualizePathStyle: Config.visualizePathStyle.get(Task.ATTACK_HOSTILE) });
            }
            creep.memory.task = Task.ATTACK_HOSTILE;
            return true;
        }
    }
    return false;

    /*    
        if (creep.memory.occupation.includes(Trait.ATTACK_HOSTILE) && actionAllowed(creep, creep.room.name)) {
            const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
    
            hostiles.sort((a: Creep, b: Creep): number => {
                return (a.hits - b.hits);
            });
            const hostile = hostiles[0];
    
            if(hostile) {
                const res = creep.attack(hostile);
                if (res == ERR_NOT_IN_RANGE) {
                    creep.moveTo(hostile, { visualizePathStyle: { stroke: '#000000' } });
                }
                creep.memory.task = Task.ATTACK_HOSTILE;
                return true;
            }
        }
    */
}
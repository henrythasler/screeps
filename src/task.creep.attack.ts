import { Task } from "./task";
import { EnergyLocation, Role, Species } from "./manager.global";
import { Trait } from "./trait";
import { Config } from "./config";
import { Loglevel, log } from "./debug";
import { filterMap, getRandomMapEntry, getRoomNameByDirection, isNearHostile, isOnBorder, mergeArrays, removeEntries } from "./helper";
import { zoo } from "./zoo";
import { categorizeCreepLocation, Location } from "./location";
import { roomInfoMap } from "./room.info";

function attack(hostile: Creep | AnyOwnedStructure, species: Species, creep: Creep,) {
    let res: CreepActionReturnCode = ERR_NO_BODYPART;
    if(species.parts.includes(RANGED_ATTACK)) {
        res = creep.rangedAttack(hostile);
    }
    else if(species.parts.includes(ATTACK)) {
        res = creep.attack(hostile);
    }
    
    if (res == ERR_NOT_IN_RANGE) {
        creep.moveTo(hostile, { visualizePathStyle: Config.visualizePathStyle.get(Task.ATTACK_HOSTILE) });
    }
    creep.memory.task = Task.ATTACK_HOSTILE;
}

export function execute(creep: Creep): boolean {
    const species = zoo.get(creep.memory.role)?.get(creep.memory.speciesName);
    if (species) {
        const location = categorizeCreepLocation(creep.room, creep.memory.homeBase);

        // derive available traits for the current room and general traits
        const traits = removeEntries(mergeArrays(species.traits.get(location), species.traits.get(Location.EVERYWHERE)), species.traits.get(Location.NOWHERE));


        if (!traits.includes(Trait.ATTACK_HOSTILE)) {
            return false;
        }

        const hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
        hostileCreeps.sort((a: Creep, b: Creep): number => {
            return (a.hits - b.hits);
        });
        const hostile = hostileCreeps[0];
        if (hostile) {
            attack(hostile, species, creep);
            return true;
        }

        const hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);
        hostileStructures.sort((a: AnyOwnedStructure, b: AnyOwnedStructure): number => {
            return (a.hits - b.hits);
        });
        const hostileStructure = hostileStructures[0];
        if (hostileStructure) {
            attack(hostileStructure, species, creep);
            return true;
        }
    }
    return false;
}
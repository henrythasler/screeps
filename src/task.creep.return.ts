import { Loglevel, log } from "./debug";
import { roomInfoMap } from "./room.info";
import { Task } from "./task";
import { Trait } from "./trait";
import { categorizeCreepLocation, Location } from "./location";
import { zoo } from "./zoo";
import { mergeArrays, removeEntries } from "./helper";
import { Config } from "./config";


export function execute(creep: Creep): boolean {
    const species = zoo.get(creep.memory.role)?.get(creep.memory.speciesName);
    if (species) {
        const location = categorizeCreepLocation(creep.room, creep.memory.homeBase);

        // derive available traits for the current room and general traits
        const traits = removeEntries(mergeArrays(species.traits.get(location), species.traits.get(Location.EVERYWHERE)), species.traits.get(Location.NOWHERE));

        if (!traits.includes(Trait.SWITCH_ROOM) || creep.store.getFreeCapacity() > 0) {
            return false;
        }

        const pos = new RoomPosition(25, 25, creep.memory.homeBase);
        const res = creep.moveTo(pos, { visualizePathStyle: Config.visualizePathStyle.get(Task.SWITCH_ROOM) });

        if (res == OK || res == ERR_TIRED) {
            creep.memory.task = Task.SWITCH_ROOM;
            return true;
        }
    }
    /*    
        if (creep.memory.occupation.includes(Trait.SWITCH_ROOM) && creep.store.getFreeCapacity() == 0 || creep.room.find(FIND_HOSTILE_CREEPS).length > 0) {
            const home = Game.rooms[creep.memory.homeBase].find(FIND_MY_SPAWNS)[0].pos;
            const res = creep.moveTo(home, { visualizePathStyle: { stroke: '#0000ff' } })
            if (([OK, ERR_TIRED].includes(res as any))) {
                creep.memory.task = Task.RETURN;
                return true;
            }
            else {
                console.log(`[ERROR] creep.moveTo(${home}) failed: ${res}`);
            }
        }
    */
    return false;
}
import { Trait } from "./trait";
import { log, Loglevel } from "./debug";
import { RoomInfo, Direction, ExitDetail, roomInfoMap, serializeRoomInfo, evaluateRoomInfo } from "./room.info";
import { Config } from "./config";
import { Task } from "./task";
import { categorizeCreepLocation, Location } from "./location";
import { zoo } from "./zoo";
import { mergeArrays, removeEntries } from "./helper";

export function execute(creep: Creep): boolean {
    const species = zoo.get(creep.memory.role)?.get(creep.memory.speciesName);
    if (species) {
        const location = categorizeCreepLocation(creep.room, creep.memory.homeBase);

        // derive available traits for the current room and general traits
        const traits = removeEntries(mergeArrays(species.traits.get(location), species.traits.get(Location.EVERYWHERE)), species.traits.get(Location.NOWHERE));

        if (!traits.includes(Trait.RECON_ROOM)) {
            return false;
        }

        const roomInfo = roomInfoMap.get(creep.room.name);
        if (roomInfo) {
            const due = roomInfo.lastVisit ? (Game.time - roomInfo.lastVisit) > (roomInfo.hostile ? Config.scoutRoomReconCooldownHostile : Config.scoutRoomReconCooldownNeutral) : true;
            if (!due) {
                return false;
            }
        }

        if (!([Task.RESERVE_CONTROLLER, Task.CLAIM_CONTROLLER].includes(creep.memory.task))) {
            roomInfoMap.set(creep.room.name, evaluateRoomInfo(creep, true));
        }
    }
    return false;
}
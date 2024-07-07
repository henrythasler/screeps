import { Task } from "./task";
import { Trait } from "./trait";
import { log, Loglevel } from "./debug";
import { filterMap, getRandomMapEntry, getRoomNameByDirection, isOnBorder } from "./helper";
import { Config } from "./config";
import { roomInfoMap } from "./roominfo";

export function execute(creep: Creep): boolean {

    if (creep.memory.occupation.includes(Trait.SCOUT_ROOMS)) {
        if (!creep.memory.targetLocation || (creep.room.name == creep.memory.targetLocation && !isOnBorder(creep))) {
            const currentRoomInfo = roomInfoMap.get(creep.room.name);
            if (currentRoomInfo) {
                const exitCandidates = filterMap(currentRoomInfo.exits, (direction, details) => {
                    const newRoom = getRoomNameByDirection(creep.room.name, direction);
                    if (newRoom) {
                        const lastVisit = roomInfoMap.get(newRoom)?.lastVisit;
                        const hostile = roomInfoMap.get(newRoom)?.hostile;
                        // revisit neutral rooms mmore often than hostile
                        const due = lastVisit ? (Game.time - lastVisit) > (hostile ? Config.scoutRoomReconCooldownHostile : Config.scoutRoomReconCooldownNeutral) : true;
                        return !details.blocked && due && !hostile;
                    }
                    return false;
                });
                const randomExit = getRandomMapEntry(exitCandidates);
                if (randomExit) {
                    const [direction, detail] = randomExit;
                    const newRoom = getRoomNameByDirection(creep.room.name, direction);
                    if (newRoom) {
                        creep.memory.targetLocation = newRoom;
                    }
                }
                else {
                    creep.memory.targetLocation = null;
                }
            }
        }

        if (creep.memory.targetLocation) {
            creep.say(`${creep.memory.targetLocation}`);
            const res = creep.moveTo(new RoomPosition(25, 25, creep.memory.targetLocation), { visualizePathStyle: { stroke: '#a00', opacity: 1, strokeWidth: 0.1 } });
            if (res == OK || res == ERR_TIRED) {
                creep.memory.task = Task.SWITCH_ROOM;
                return true;
            }
            else {
                log(`[ERROR][SCOUT] moveTo(${creep.memory.targetLocation}): ${res}`, Loglevel.DEBUG);
                creep.memory.targetLocation = null;
            }
        }
    }
    return false;
}

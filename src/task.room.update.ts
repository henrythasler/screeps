import { Config } from "./config";
import { RoomInfo, Direction, ExitDetail, roomInfoMap, serializeRoomInfo, evaluateRoomInfo } from "./room.info";

export function execute(creep: Creep): boolean {
    const roomInfo = roomInfoMap.get(creep.room.name);
    if(roomInfo) {
        const update = evaluateRoomInfo(creep, false);
        roomInfo.hostileCreeps = update.hostileCreeps;
        roomInfo.hostileStructures = update.hostileStructures;
        roomInfo.hostile = update.hostile;
        roomInfo.availableSources = update.availableSources;
        roomInfo.reserved = update.reserved,
        roomInfo.occupied = update.occupied,
        roomInfo.base = update.base;
        // do not update timestamp to allow scouts to re-visit the room
    }
    return false;
}
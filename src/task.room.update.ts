import { RoomInfo, Direction, ExitDetail, roomInfoMap, serializeRoomInfo } from "./room.info";

export function execute(creep: Creep): boolean {
    const roomInfo = roomInfoMap.get(creep.room.name);
    if(roomInfo) {
        roomInfo.hostile = creep.room.find(FIND_HOSTILE_CREEPS).length > 0;
        roomInfo.availableSources = creep.room.find(FIND_SOURCES).length;
        // do not update timestamp
    }
    return false;
}
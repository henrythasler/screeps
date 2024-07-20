import { RoomInfo, Direction, ExitDetail, roomInfoMap, serializeRoomInfo } from "./room.info";

export function execute(creep: Creep): boolean {
    const roomInfo = roomInfoMap.get(creep.room.name);
    if(roomInfo) {
        roomInfo.hostile = creep.room.find(FIND_HOSTILE_CREEPS).length > 0;
        roomInfo.availableSources = creep.room.find(FIND_SOURCES).length;
        roomInfo.reserved = creep.room.controller?.reservation != undefined;
        roomInfo.base = creep.room.find(FIND_MY_SPAWNS).length > 0;
        // do not update timestamp to allow scouts to re-visit the room
    }
    return false;
}
import { Config } from "./config";
import { roomInfoMap } from "./room.info";

export enum Location {
    EVERYWHERE, // these action will always be available; allow-list
    HOMEBASE,   // where the creep was spawned
    OUTPOST,    // has a friendly controller
    REMOTE,     // unoccupied room
    RESERVED,   // reserved by player
    OCCUPIED,   // reserved by non-hostile player (Invader)
    HOSTILE,    // includes hostile creeps or structures
    NOWHERE,    // opposite of everywhere; a block-list
}

export function categorizeCreepLocation(creep: Creep): Location {
    if (creep.room.name == creep.memory.homeBase) {
        return Location.HOMEBASE;
    }

    const controller = creep.room.controller;
    if (controller && controller.my) {
        return Location.OUTPOST;
    }

    if (controller && !controller.my && controller.reservation?.username == Config.userName) {
        return Location.RESERVED;
    }

    if (controller && !controller.my && controller.reservation) {
        return Location.OCCUPIED;
    }

    const roomInfo = roomInfoMap.get(creep.room.name);
    if (roomInfo && roomInfo.hostile) {
        return Location.HOSTILE;
    }

    return Location.REMOTE;
}

export function canExecuteAction(): boolean {
    // if (target.room.name == creep.memory.homeBase && locations.includes(Trait.ACTION_HOME)) {
    //     return true;
    // }

    // let allowed = false;
    // Config.minControllerLevel.forEach((_, roomName) => {
    //     if (roomName != creep.memory.homeBase && target.room.name == roomName && locations.includes(Trait.ACTION_OUTPOST)) {
    //         allowed = true;
    //     }
    // });
    // if (allowed) {
    //     return true;
    // }

    // const hops = Game.map.getRoomLinearDistance(creep.room.name, target.room.name);
    // if (locations.includes(Trait.ACTION_AWAY) && hops <= maxHops) {
    //     return true;
    // }    
    return true;
}
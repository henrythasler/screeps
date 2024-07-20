import { Config } from "./config";
import { roomInfoMap } from "./room.info";

export enum Location {
    EVERYWHERE, // these action will always be available; allow-list
    HOME,       // where the creep was spawned
    BASE,       // has a friendly controller and at least one spawn
    OUTPOST,    // has a friendly controller but NO spawn
    REMOTE,     // unoccupied room
    RESERVED,   // reserved by player
    OCCUPIED,   // reserved by non-hostile player (Invader)
    HOSTILE,    // includes hostile creeps or structures
    NOWHERE,    // opposite of everywhere; a block-list
}

export function categorizeCreepLocation(room: Room, homeBase: string): Location {
    if (room.name == homeBase) {
        return Location.HOME;
    }

    const controller = room.controller;
    const mySpawns = room.find(FIND_MY_SPAWNS);

    if (controller && controller.my && mySpawns.length) {
        return Location.BASE;
    }

    if (controller && controller.my) {
        return Location.OUTPOST;
    }    

    if (controller && !controller.my && controller.reservation?.username == Config.userName) {
        return Location.RESERVED;
    }

    if (controller && !controller.my && controller.reservation) {
        return Location.OCCUPIED;
    }

    const roomInfo = roomInfoMap.get(room.name);
    if (roomInfo && roomInfo.hostile) {
        return Location.HOSTILE;
    }

    return Location.REMOTE;
}

export function locationToString(location: Location): string {
    switch(location) {
        case Location.HOME: return "HOME";
        case Location.BASE: return "BASE";
        case Location.OUTPOST: return "OUTPOST";
        case Location.REMOTE: return "REMOTE";
        case Location.RESERVED: return "RESERVED";
        case Location.OCCUPIED: return "OCCUPIED";
        case Location.HOSTILE: return "HOSTILE";
        default: return "undefined";
    }
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
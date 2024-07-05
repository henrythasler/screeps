export enum Location {
    HOMEBASE,   // where the creep was spawned
    OUTPOST,    // has a friendly spawn
    REMOTE,     // unoccupied room
    HOSTILE,    // includes hostile creeps or structures
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
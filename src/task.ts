export enum Task {
    IDLE,
    CHARGE,
    MOVETO,
    CHARGE_STRUCTURE,
    CHARGE_CONTROLLER,
    BUILD_STRUCTURE,
    STORE_ENERGY,
    REPAIR_STRUCTURE,
    REFRESH_CONTROLLER,
    CLAIM_CONTROLLER,
    RESERVE_CONTROLLER,
    SWITCH_ROOM,
    RETURN, // return to homeBase
    RENEW, // increase ticksToLive at spawn
    HARVEST, // harvest energy from source
    ATTACK_HOSTILE, // attack hostile creep
    // LOCATE_SOURCE,  // move to a knownSource in another room for charging/harvesting
}

// can always be interrupted by another task
export const idleTasks: Task[] = [
    Task.IDLE,
    Task.MOVETO,
];

export function sayTask(creep: Creep): void {
    switch (creep.memory.task) {
        case Task.CHARGE: creep.say('🪫'); break;
        case Task.MOVETO: creep.say('👣'); break;
        case Task.CHARGE_STRUCTURE: creep.say('⚡'); break;
        case Task.CHARGE_CONTROLLER: creep.say('⬆️'); break;
        case Task.BUILD_STRUCTURE: creep.say('🔨'); break;
        case Task.STORE_ENERGY: creep.say('🔋'); break;
        case Task.REPAIR_STRUCTURE: creep.say('🔧'); break;
        case Task.REFRESH_CONTROLLER: creep.say('🚿'); break;
        case Task.CLAIM_CONTROLLER: creep.say('🚩'); break;
        case Task.RESERVE_CONTROLLER: creep.say('🏳️'); break;
        case Task.SWITCH_ROOM: creep.say('🚪'); break;
        case Task.RETURN: creep.say('🏠'); break;
        case Task.RENEW: creep.say('🏥'); break;
        case Task.HARVEST: creep.say('🚜'); break;
        case Task.ATTACK_HOSTILE: creep.say('⚔️'); break;
        default: creep.say('💤');
    }
}


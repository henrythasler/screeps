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
}

// can always be interrupted by another task
export const idleTasks: Task[] = [
    Task.IDLE,
    Task.MOVETO,
];

// must not be interrupted
export const nonInterruptableTasks: Task[] = [
    Task.CHARGE,
    Task.REFRESH_CONTROLLER,
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
        default: creep.say('💤');
    }    
}


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

export enum Role {
    WORKER,
}

export enum Task {
    IDLE,
    CHARGE,
    MOVETO,
    CHARGE_STRUCTURE,
    CONTROLLER_CHARGE,
    BUILD_STRUCTURE,
    STORE_ENERGY,
    STRUCTURE_REPAIR,
    CONTROLLER_REFRESH,
}

export enum EnergySource {
    OTHER,
    SOURCE,
    CONTAINER,
}

export function roleToString(role: Role): string {
    if (role == Role.WORKER) return "WORKER";
    return "unknown";
}

export function taskToString(task: Task): string {
    if (task == Task.IDLE) return "IDLE";
    if (task == Task.CHARGE) return "CHARGE";
    if (task == Task.CHARGE_STRUCTURE) return "CHARGE_STRUCTURE";
    if (task == Task.CONTROLLER_CHARGE) return "UPGRADE_STRUCTURE";
    if (task == Task.BUILD_STRUCTURE) return "BUILD_STRUCTURE";
    return "unknown";
}
export enum Role {
    WORKER,
}

export enum Task {
    IDLE,
    CHARGE,
    CHARGE_STRUCTURE,
    UPGRADE_STRUCTURE,
    BUILD_STRUCTURE,
}


export function roleToString(role: Role): string {
    if (role == Role.WORKER) return "WORKER";
    return "unknown";
}

export function taskToString(task: Task): string {
    if (task == Task.IDLE) return "IDLE";
    if (task == Task.CHARGE) return "CHARGE";
    if (task == Task.CHARGE_STRUCTURE) return "CHARGE_STRUCTURE";
    if (task == Task.UPGRADE_STRUCTURE) return "UPGRADE_STRUCTURE";
    if (task == Task.BUILD_STRUCTURE) return "BUILD_STRUCTURE";
    return "unknown";
}
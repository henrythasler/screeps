import { Task } from "./manager.global";

export const taskPriority: Task[] = [
    Task.CHARGE_STRUCTURE,
    Task.CONTROLLER_CHARGE,
    Task.BUILD_STRUCTURE,
    Task.IDLE,
];

// can always be interrupted by another task
export const idleTasks: Task[] = [
    Task.IDLE,
    Task.MOVETO,
];

export const nonInterruptableTasks: Task[] = [
    Task.CHARGE,
    Task.CONTROLLER_REFRESH,
];

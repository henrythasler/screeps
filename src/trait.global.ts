import { Task } from "./types";

export const taskPriority: Task[] = [
    Task.CHARGE_STRUCTURE,
    Task.CHARGE_CONTROLLER,
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
];

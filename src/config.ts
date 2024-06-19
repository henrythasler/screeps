import { Task } from "./types";

class Worker {
    static minCountPerRoom = 12;
    static availableTraits: Task[] = [
        Task.IDLE,
        Task.CHARGE,
        Task.MOVETO,
        Task.CHARGE_STRUCTURE,
        Task.CONTROLLER_CHARGE,
        Task.BUILD_STRUCTURE,
        Task.STORE_ENERGY,
        Task.STRUCTURE_REPAIR,
        Task.CONTROLLER_REFRESH,
    ];
    static traitDistribution: Map<Task, number> = new Map([
        [Task.IDLE, 1],
        [Task.CHARGE, 1],
        [Task.MOVETO, 1],
        [Task.CHARGE_STRUCTURE, 0.5],
        [Task.CONTROLLER_CHARGE, 0.5],
        [Task.BUILD_STRUCTURE, 0.5],
        [Task.STORE_ENERGY, 1],
        [Task.STRUCTURE_REPAIR, 0.5],
        [Task.CONTROLLER_REFRESH, 0.01],
    ]);
}

export class Config {
    static minControllerLevel = 4;
    static worker = Worker;
}
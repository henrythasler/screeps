import { Task } from "./manager.global";

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
        [Task.CONTROLLER_CHARGE, 1],
        [Task.BUILD_STRUCTURE, 1],
        [Task.STORE_ENERGY, 1],
        [Task.STRUCTURE_REPAIR, 0.5],
        [Task.CONTROLLER_REFRESH, 0.2],
    ]);
}

class Scout {
    static minCountPerRoom = 0;
    static availableTraits: Task[] = [
        Task.IDLE,
        Task.CHARGE,
        Task.MOVETO,
        Task.CONTROLLER_CLAIM,
        Task.CONTROLLER_RESERVE,
        Task.SCOUT,
    ];
    static traitDistribution: Map<Task, number> = new Map([
        [Task.IDLE, 1],
        [Task.CHARGE, 1],
        [Task.MOVETO, 1],
        [Task.CONTROLLER_CLAIM, 1],
        [Task.CONTROLLER_RESERVE, 1],
        [Task.SCOUT, 1],
    ]);
}

export class Config {
    static minControllerLevel = 5;
    static worker = Worker;
    static scout = Scout;
}

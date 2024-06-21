import { Task } from "./task";

class Worker {
    static minCountPerRoom = 12;
    static availableTraits: Task[] = [
        Task.IDLE,
        Task.CHARGE,
        Task.MOVETO,
        Task.CHARGE_STRUCTURE,
        Task.CHARGE_CONTROLLER,
        Task.BUILD_STRUCTURE,
        Task.STORE_ENERGY,
        Task.REPAIR_STRUCTURE,
        Task.REFRESH_CONTROLLER,
    ];
    static traitDistribution: Map<Task, number> = new Map([
        [Task.IDLE, 1],
        [Task.CHARGE, 1],
        [Task.MOVETO, 1],
        [Task.CHARGE_STRUCTURE, 0.5],
        [Task.CHARGE_CONTROLLER, 1],
        [Task.BUILD_STRUCTURE, 1],
        [Task.STORE_ENERGY, 1],
        [Task.REPAIR_STRUCTURE, 0.5],
        [Task.REFRESH_CONTROLLER, 0.2],
    ]);
}

class Scout {
    static minCountPerRoom = 0;
    static availableTraits: Task[] = [
        Task.IDLE,
        Task.CHARGE,
        Task.MOVETO,
        Task.CLAIM_CONTROLLER,
        Task.RESERVE_CONTROLLER,
        Task.SWITCH_ROOM,
    ];
    static traitDistribution: Map<Task, number> = new Map([
        [Task.IDLE, 1],
        [Task.CHARGE, 1],
        [Task.MOVETO, 1],
        [Task.CLAIM_CONTROLLER, 1],
        [Task.RESERVE_CONTROLLER, 1],
        [Task.SWITCH_ROOM, 1],
    ]);
}

export class Config {
    static minControllerLevel = 5;
    static worker = Worker;
    static scout = Scout;
}

export enum Role {
    WORKER,
    SCOUT,
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
    CONTROLLER_CLAIM,
    CONTROLLER_RESERVE,
    SCOUT,
}

export enum EnergyLocation {
    OTHER,
    SOURCE,
    CONTAINER,
}

export function roleToString(role: Role): string {
    if (role == Role.WORKER) return "Worker";
    if (role == Role.SCOUT) return "Scout";
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

export const bodyPartCosts: Map<BodyPartConstant, number> = new Map([
    [MOVE, 50],
    [WORK, 100],
    [CARRY, 50],
    [ATTACK, 80],
    [RANGED_ATTACK, 150],
    [HEAL, 250],
    [CLAIM, 600],
    [TOUGH, 10],
]);

export enum SpeciesName {
    WORKER_ENTRY,
    WORKER_ENTRY_SLOW,
    WORKER_ENTRY_FAST,
    WORKER_ENTRY_HEAVY,
    WORKER_BASIC,
    WORKER_BASIC_SLOW,
    WORKER_BASIC_FAST,
    WORKER_BASIC_HEAVY,

    SCOUT_ENTRY = 0x100,
}

export interface Species {
    parts: BodyPartConstant[],
    cost: number,
}

export function findMostExpensiveCreep(budget: number, zoo: Map<SpeciesName, Species>): SpeciesName | null {
    let selection: SpeciesName | null = null;
    zoo.forEach((value, key) => {
        if ((value.cost <= budget) && ((selection != null) ? value.cost >= zoo.get(selection)!.cost : true)) {
            selection = key;
        }
    });
    console.log(`Selected species: ${selection} (${selection ? zoo.get(selection)?.cost : "0"}), energyCapacityAvailable: ${budget}`);
    return selection;
}
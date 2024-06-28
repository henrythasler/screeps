import { Loglevel, log } from "./debug";
import { Task } from "./task";
import { Trait } from "./trait";

export enum Role {
    WORKER,
    SCOUT,
    COLLECTOR,
    HARVESTER,
}

export enum Class {
    NONE = 0,
    WORKER_LOCAL = 1,
    WORKER_REMOTE = 2,
}

export const TaskPriority: Task[] = [

];

export enum EnergyLocation {
    OTHER,
    SOURCE,
    CONTAINER,
    STORAGE,
}

export enum Alert {
    LOW_TTL,
}

export function roleToString(role: Role): string {
    if (role == Role.WORKER) return "Worker";
    if (role == Role.SCOUT) return "Scout";
    if (role == Role.COLLECTOR) return "Collector";
    return "unknown";
}

export function taskToString(task: Task): string {
    if (task == Task.IDLE) return "IDLE";
    if (task == Task.CHARGE) return "CHARGE";
    if (task == Task.CHARGE_STRUCTURE) return "CHARGE_STRUCTURE";
    if (task == Task.CHARGE_CONTROLLER) return "UPGRADE_STRUCTURE";
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

export interface Species {
    parts: BodyPartConstant[],
    traits: Trait[],
    cost: number,
    name?: string,
}

export function findMostExpensiveSpecies(budget: number, ticksWithoutSpawn: number | undefined, zoo: Map<string, Species>): Species | undefined {
    let speciesName: string = "null";
    ticksWithoutSpawn = ticksWithoutSpawn ? ticksWithoutSpawn : 0;
    const actualBudget = budget - ticksWithoutSpawn;
    zoo.forEach((value, key) => {
        if ((value.cost <= actualBudget) && ((speciesName != "null") ? value.cost >= zoo.get(speciesName)!.cost : true)) {
            speciesName = key;
        }
    });

    const species = zoo.get(speciesName);
    if (species) {
        species.name = speciesName;
        console.log(`Selected species: ${speciesName} (${species.cost}), energyCapacityAvailable: ${budget}, budget: ${actualBudget}`);
    }
    return species;
}

export function applyTraitDistribution(creep: Creep, population: number, creepsPerTrait: Map<Trait, number>, expectedDistribution: Map<Trait, number>): Trait[] {
    const occupation: Trait[] = [];
    expectedDistribution.forEach((probability, trait) => {
        if (creepsPerTrait.has(trait)) {
            const numCreeps = creepsPerTrait.get(trait)!;
            if (creep.memory.traits.includes(trait) && (numCreeps < Math.ceil(probability * population))) {
                occupation.push(trait);
                creepsPerTrait.set(trait, numCreeps + 1);
            }
        }
        else if (creep.memory.traits.includes(trait) && probability > 0) {
            occupation.push(trait);
            creepsPerTrait.set(trait, 1);
        }
    });
    return occupation;


    /*    
        for (const trait of Config.worker.availableTraits) {
    
            const current = currentDistribution.get(trait);
            const expected = Config.worker.traitDistribution.get(trait);
    
            if (numCreeps >= 10) {
                if (creep.memory.traits.includes(trait) && expected && (creep.memory.percentile <= (expected * 100))) {
                    creep.memory.occupation.push(trait);
                }
            }
            else {
                if (current && expected) {
                    if (creep.memory.traits.includes(trait) && (current < Math.ceil(expected * numCreeps))) {
                        creep.memory.occupation.push(trait);
                        currentDistribution.set(trait, current + 1);
                    }
                }
                else if (creep.memory.traits.includes(trait) && expected && expected > 0) {
                    creep.memory.occupation.push(trait);
                    currentDistribution.set(trait, 1);
                }
            }
        }    
    */
}

export function managePopulation(required: number, current: number, room: Room, zoo: Map<string, Species>, role: Role): number {
    let requested = 0;
    if (current < required) {
        const species = findMostExpensiveSpecies(room.energyCapacityAvailable, room.memory.ticksWithPendingSpawns, zoo);
        if (species) {
            room.memory.buildQueue.push({ species: species, role: role });
            requested++;
        }
    }
    return requested;
}

export function manageTraitDistribution(creeps: Creep[], zoo: Map<string, Species>, traitDistribution: Map<Trait, number>): void {
    const currentDistribution: Map<Trait, number> = new Map();
    for (const creep of creeps) {
        // update traits from blueprint
            const species = zoo.get(creep.memory.speciesName);
            creep.memory.traits = species?.traits ?? [];

        // assign occupation
        creep.memory.occupation = applyTraitDistribution(creep, creeps.length, currentDistribution, traitDistribution);
        log(`[${creep.name}][${creep.memory.speciesName}] traits: [${creep.memory.traits}], occupation: [${creep.memory.occupation}]`, Loglevel.DEBUG);
    }
}

export function creepMaintenance(): void {
    if ((Game.time % 60) == 0) {
        // clean up dead creeps every n ticks
        for (const name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                // console.log('Clearing non-existing creep memory:', name);
            }
        }
    }
}
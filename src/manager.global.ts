import { Task } from "./task";
import { Trait } from "./trait";

export enum Role {
    WORKER,
    SCOUT,
    COLLECTOR,
}

export enum Class {
    NONE = 0,
    WORKER_LOCAL = 1,
    WORKER_REMOTE = 2,
}

export enum EnergyLocation {
    OTHER,
    SOURCE,
    CONTAINER,
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

    console.log(`Selected species: ${speciesName} (${zoo.get(speciesName)?.cost}), energyCapacityAvailable: ${budget}, budget: ${actualBudget}`);
    const species = zoo.get(speciesName);
    if (species) {
        species.name = speciesName;
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
import { Config } from "./config";
import { log, Loglevel } from "./debug";
import { RoomInfo, createRoomInfoMap, roomInfoMap } from "./room.info";
import { Task } from "./task";
import { Trait } from "./trait";

export enum Role {
    WORKER,
    SCOUT,
    COLLECTOR,
    HARVESTER,
    DEFENDER,
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
    STORAGE,
    LINK,
}

export enum Alert {
    LOW_TTL,
}

export function roleToString(role: Role): string {
    if (role == Role.WORKER) return "Worker";
    if (role == Role.SCOUT) return "Scout";
    if (role == Role.COLLECTOR) return "Collector";
    if (role == Role.HARVESTER) return "Harvester";
    if (role == Role.DEFENDER) return "Defender";
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

export function findMostExpensiveSpecies(capacity: number, available: number, ticksWithPendingSpawns: number, zoo: Map<string, Species>): Species | undefined {
    let speciesName: string = "null";
    const actualBudget = Math.max(300, capacity - ticksWithPendingSpawns);
    zoo.forEach((value, key) => {
        if ((value.cost <= actualBudget || value.cost <= available) && ((speciesName != "null") ? value.cost >= zoo.get(speciesName)!.cost : true)) {
        speciesName = key;
        }
    });
    log(`actualBudget: ${actualBudget} ticksWithPendingSpawns: ${ticksWithPendingSpawns} speciesName: ${speciesName}`, Loglevel.DEBUG);
    const species = zoo.get(speciesName);
    if (species) {
        species.name = speciesName;
        console.log(`selected species: ${speciesName} (${species.cost}), capacity: ${capacity}, budget: ${actualBudget}`);
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
}

export function managePopulation(required: number, current: number, room: Room, zoo: Map<string, Species>, role: Role): number {
    const alreadyQueued = room.memory.buildQueue.some((species) => {
        if (species.role == role) return true;
        return false;
    });

    let spawning = 0;
    const availableSpawns = room.find(FIND_MY_SPAWNS);
    availableSpawns.forEach((spawn) => {
        if (spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name]!;
            if (spawningCreep.memory.role == role) {
                spawning++;
            }
        }
    });

    let requested = 0;
    if (current + spawning < required && !alreadyQueued) {
        const species = findMostExpensiveSpecies(room.energyCapacityAvailable, room.energyAvailable, room.memory.ticksWithPendingSpawns, zoo);
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
            }
        }
    }
}

export function showCreepCensus(roomName: string, census: Map<Role, { current: number, required: number }>): void {
    let text = `[${roomName}] `;
    census.forEach((details, role) => text += `${roleToString(role)}: ${details.current}/${details.required}, `);
    log(text);
}

export function initializeGlobalObjects(): void {
}

export function initializeRoomObjects(room: Room): void {
    if (!room.memory.buildQueue) {
        room.memory.buildQueue = [];
    }

    if (!room.memory.ticksWithPendingSpawns) {
        room.memory.ticksWithPendingSpawns = 0;
    }
}
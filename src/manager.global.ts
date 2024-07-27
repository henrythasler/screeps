import { Config } from "./config";
import { log, Loglevel } from "./debug";
import { Location } from "./location";
import { RoomInfo, createRoomInfoMap, roomInfoMap } from "./room.info";
import { Task } from "./task";
import { Trait } from "./trait";

export enum Role {
    WORKER,
    SCOUT,
    COLLECTOR,
    HARVESTER,
    DEFENDER,
    HUNTER,
    MINER,
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

export type RequesterIdTypes = StructureExtension | StructureSpawn | StructureTower;
export interface PlainPosition {
    roomName: string;
    x: number;
    y: number;    
}

export interface Requisition {
    requesterId: Id<RequesterIdTypes>,
    resource: ResourceConstant,
    amount: number,
    priority: number,   // higher is more important
    position: PlainPosition,
}

export function roleToString(role: Role): string {
    if (role == Role.WORKER) return "Worker";
    if (role == Role.SCOUT) return "Scout";
    if (role == Role.COLLECTOR) return "Collector";
    if (role == Role.HARVESTER) return "Harvester";
    if (role == Role.DEFENDER) return "Defender";
    if (role == Role.HUNTER) return "Hunter";
    if (role == Role.MINER) return "Miner";
    return "unknown";
}

export function taskToString(task: Task): string {
    if (task == Task.IDLE) return "IDLE";
    if (task == Task.CHARGE) return "CHARGE";
    if (task == Task.CHARGE_STRUCTURE) return "CHARGE_STRUCTURE";
    if (task == Task.UPGRADE_CONTROLLER) return "UPGRADE_STRUCTURE";
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
    traits: Map<Location, Trait[]>,
    cost: number,
    name?: string,
}

export function findMostExpensiveSpecies(capacity: number, available: number, ticksWithPendingSpawns: number, zoo: Map<string, Species>): Species | undefined {
    let speciesName: string = "null";
    const actualBudget = Math.max(300, capacity - ticksWithPendingSpawns * 4);
    zoo.forEach((value, key) => {
        if ((value.cost <= actualBudget || value.cost <= available) && ((speciesName != "null") ? value.cost >= zoo.get(speciesName)!.cost : true)) {
            speciesName = key;
        }
    });
    log(`actualBudget: ${actualBudget} ticksWithPendingSpawns: ${ticksWithPendingSpawns} speciesName: ${speciesName}`, Loglevel.DEBUG);
    const species = zoo.get(speciesName);
    if (species) {
        species.name = speciesName;
        log(`selected species: ${speciesName} (${species.cost}), capacity: ${capacity}, budget: ${actualBudget}`);
    }
    return species;
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

export function showCreepCensus(room: Room, census: Map<Role, { current: number, required: number }>): void {
    let text = `[${room.name}][${room.energyAvailable}/${room.energyCapacityAvailable}] `;
    census.forEach((details, role) => text += `${roleToString(role)}: ${details.current}/${details.required}, `);
    log(text);
}

export function initializeGlobalObjects(): void {
    if (!Memory.pendingRequisitions) {
        Memory.pendingRequisitions = [];
    }
}

export function initializeRoomObjects(room: Room): void {
    if (!room.memory.buildQueue) {
        room.memory.buildQueue = [];
    }

    if (!room.memory.ticksWithPendingSpawns) {
        room.memory.ticksWithPendingSpawns = 0;
    }
}

export function initializeCreepObjects(creep: Creep): void {
    if (!creep.memory.activeRequisitions) {
        creep.memory.activeRequisitions = [];
    }
}

export function logRequisitions(roomName?: string): void {
    const pending = Memory.pendingRequisitions.reduce((sum: string, req) => { 
        if(req.position.roomName == roomName) {
            
            return `${sum} [${req.amount}, ${req.position.x}/${req.position.y}, ${Game.getObjectById(req.requesterId)?.structureType}]`
        }
        return sum;
    }, "");
    const creepReqs: string[] = [];

    for(const creepId in Game.creeps) {
        const creep = Game.creeps[creepId];
        if(creep && creep.memory.activeRequisitions.length && creep.room.name == roomName) {
            creepReqs.push(`${creep.name} ${creep.memory.activeRequisitions.reduce((sum: string, req) => {return `${sum} [${req.amount}, ${req.position.x}/${req.position.y}]`}, "")}`)
        }
    }

    log(`creeps: ${creepReqs.join(", ")}, pendingRequisitions: ${pending}`, Loglevel.INFO);
}
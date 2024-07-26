import { Config } from "./config";
import { log, Loglevel } from "./debug";

export enum Direction {
    TOP = 'TOP',
    RIGHT = 'RIGHT',
    BOTTOM = 'BOTTOM',
    LEFT = 'LEFT'
}

export interface ExitDetail {
    blocked: boolean;   // blocked by a wall or other obstacle
}

export interface RoomInfo {
    exits: Map<Direction, ExitDetail>;
    lastVisit: number;
    hostile: boolean;
    reserved: boolean;
    occupied: boolean;
    hostileCreeps: number;
    hostileStructures: number;
    base: boolean;
    availableSources: number;
}

// First, let's define a serializable version of RoomInfo
export interface SerializableRoomInfo {
    exits: { [key in Direction]?: ExitDetail };
    lastVisit: number;
    hostile: boolean;
    reserved: boolean;  // reserved by self
    occupied: boolean;  // reserved by other player
    hostileCreeps: number;
    hostileStructures: number;    
    base: boolean;
    availableSources: number;
}

// Function to serialize a RoomInfo object
export function serializeRoomInfo(roomInfo: RoomInfo): SerializableRoomInfo {
    const serializedExits: { [key in Direction]?: ExitDetail } = {};
    roomInfo.exits.forEach((value, key) => {
        serializedExits[key] = value;
    });
    return {
        exits: serializedExits,
        lastVisit: roomInfo.lastVisit,
        hostile: roomInfo.hostile,
        reserved: roomInfo.reserved,
        occupied: roomInfo.occupied,
        hostileCreeps: roomInfo.hostileCreeps,
        hostileStructures: roomInfo.hostileStructures,        
        base: roomInfo.base,
        availableSources: roomInfo.availableSources,
    };
}

// Function to deserialize back to RoomInfo
function deserializeRoomInfo(serialized: SerializableRoomInfo): RoomInfo {
    return {
        exits: new Map(Object.entries(serialized.exits) as [Direction, ExitDetail][]),
        lastVisit: serialized.lastVisit,
        hostile: serialized.hostile,
        reserved: serialized.reserved,
        occupied: serialized.occupied,
        hostileCreeps: serialized.hostileCreeps,
        hostileStructures: serialized.hostileStructures,        
        base: serialized.base,
        availableSources: serialized.availableSources,
    };
}

// Storing the RoomInfo map in Memory
export function storeRoomInfoMap(roomInfoMap: Map<string, RoomInfo>) {
    const serialized: { [roomName: string]: SerializableRoomInfo } = {};
    roomInfoMap.forEach((roomInfo, roomName) => {
        serialized[roomName] = serializeRoomInfo(roomInfo);
    });
    Memory.roomInfoMap = serialized;
}

// Retrieving the RoomInfo map from Memory
export function getRoomInfoMap(): Map<string, RoomInfo> {
    const serialized = Memory.roomInfoMap;
    if (!serialized) return new Map<string, RoomInfo>();

    const result = new Map<string, RoomInfo>();
    for (const roomName in serialized) {
        if (serialized.hasOwnProperty(roomName)) {
            const serializedInfo = serialized[roomName];
            if (serializedInfo) {  // Add this check
                result.set(roomName, deserializeRoomInfo(serializedInfo));
            }
        }
    }
    return result;
}

export let roomInfoMap: Map<string, RoomInfo>;

export function loadRoomInfoMap(): void {
    roomInfoMap = getRoomInfoMap();
}

export function saveRoomInfoMap(): void {
    storeRoomInfoMap(roomInfoMap);
}

export function createRoomInfoMap(): void {
    roomInfoMap = new Map<string, RoomInfo>();
}

function evaluateExitProperties(exitTo: string, direction: Direction, creep: Creep, visuals: boolean): ExitDetail {
    let blocked = true;

    const steps: PathStep[] = creep.pos.findPathTo(new RoomPosition(25, 25, exitTo));
    // log(`${direction}: ${steps.length} (${steps[steps.length - 1]?.x}, ${steps[steps.length - 1]?.y})`, Loglevel.DEBUG);

    if (steps.length) {

        if (visuals) {
            const path: RoomPosition[] = [];
            steps.forEach((step) => {
                path.push(new RoomPosition(step.x, step.y, creep.room.name));
            });
            creep.room.visual.poly(path);
        }

        switch (direction) {
            case Direction.TOP: blocked = steps[steps.length - 1]?.y != 0; break;
            case Direction.RIGHT: blocked = steps[steps.length - 1]?.x != 49; break;
            case Direction.BOTTOM: blocked = steps[steps.length - 1]?.y != 49; break;
            case Direction.LEFT: blocked = steps[steps.length - 1]?.x != 0; break;
        }
    }
    return {
        blocked: blocked,
    };
}

export function evaluateRoomInfo(creep: Creep, evalExits: boolean): RoomInfo {
    const exits = new Map<Direction, ExitDetail>();

    if (evalExits) {
        const exitsTemp = Game.map.describeExits(creep.room.name);
        if (exitsTemp && exitsTemp[1]) exits.set(Direction.TOP, evaluateExitProperties(exitsTemp[1], Direction.TOP, creep, Config.roomReconVisuals));
        if (exitsTemp && exitsTemp[3]) exits.set(Direction.RIGHT, evaluateExitProperties(exitsTemp[3], Direction.RIGHT, creep, Config.roomReconVisuals));
        if (exitsTemp && exitsTemp[5]) exits.set(Direction.BOTTOM, evaluateExitProperties(exitsTemp[5], Direction.BOTTOM, creep, Config.roomReconVisuals));
        if (exitsTemp && exitsTemp[7]) exits.set(Direction.LEFT, evaluateExitProperties(exitsTemp[7], Direction.LEFT, creep, Config.roomReconVisuals));
    }

    const hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS).length;
    const hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES).length;

    const roominfo: RoomInfo = {
        exits: exits,
        lastVisit: Game.time,
        hostile: hostileCreeps > 0 || hostileStructures > 0,
        reserved: creep.room.controller?.reservation != undefined && creep.room.controller.reservation.username == Config.userName,
        occupied: creep.room.controller?.reservation != undefined && creep.room.controller.reservation.username != Config.userName,
        hostileCreeps: hostileCreeps,
        hostileStructures: hostileStructures,
        base: creep.room.find(FIND_MY_SPAWNS).length > 0,
        availableSources: creep.room.find(FIND_SOURCES).length,
    };

    return roominfo;
}
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

export function logRoomInfoMap(): void {
    const reqOwnerStr = Memory.requisitionOwner.reduce( (sum:string, item) => {return `${sum} ${Game.getObjectById(item)?.structureType}`}, "");
    const pending = Memory.pendingRequisitions.reduce((sum: string, req) => { return `${sum} [${req.position.roomName}, ${req.requesterId}, ${req.amount}]`}, "");
    const creepReqs: string[] = [];

    for(const creepId in Game.creeps) {
        const creep = Game.creeps[creepId];
        if(creep && creep.memory.activeRequisitions.length) {
            creepReqs.push(`${creep.name} ${creep.memory.activeRequisitions.reduce((sum: string, req) => {return `${sum} [${req.amount}]`}, "")}`)
        }
    }

    log(`creeps: ${creepReqs.join(", ")}, requisitionOwner: ${reqOwnerStr}, pendingRequisitions: ${pending}`, Loglevel.INFO);
}
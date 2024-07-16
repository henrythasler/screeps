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
    availableSources: number;
}

// First, let's define a serializable version of RoomInfo
export interface SerializableRoomInfo {
    exits: { [key in Direction]?: ExitDetail };
    lastVisit: number;
    hostile: boolean;
    reserved: boolean;  // reserved by self
    occupied: boolean;  // reserved by other player
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

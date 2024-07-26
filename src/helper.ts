import { Trait } from "./trait";
import { Config } from "./config";
import { Direction, roomInfoMap, serializeRoomInfo } from "./room.info";
import { log } from "./debug";
import { Role } from "./manager.global";

export function isNearHostile(entity: ConstructionSite | AnyStructure | Creep | Source | Ruin | Resource | Tombstone, hostiles: Creep[]): boolean {
    return hostiles.some((hostile) => { return entity.pos.getRangeTo(hostile.pos) < Config.minHostileDistance });
}

export function countRoomHops(path: RoomPosition[]): number {
    return path.reduce((hops: string[], pos: RoomPosition) => {
        if (!hops.includes(pos.roomName)) {
            hops.push(pos.roomName);
        }
        return hops;
    }, [] as string[]).length;
}

export function isInHomeBase(creep: Creep): boolean {
    return creep.room.name == creep.memory.homeBase;
}

export function getRandomMapEntry<K, V>(map: Map<K, V>): [K, V] | undefined {
    const entries = Array.from(map.entries());
    if (entries.length == 0) {
        return undefined;
    }
    const randomIndex = Math.floor(Math.random() * entries.length);
    return entries[randomIndex];
}

export function filterMap<K, V>(
    map: Map<K, V>,
    predicate: (key: K, value: V) => boolean
): Map<K, V> {
    return new Map(
        Array.from(map.entries()).filter(([key, value]) => predicate(key, value))
    );
}

/**
 * Extract coordinates numbers from a given room name
 * @param roomName 
 * @returns a pair of numbers representing the room coordinate offsets
 */
function extractCoordinates(roomName: string): [number, number] | null {
    const match = roomName.match(/[EW](\d+)[NS](\d+)/);
    if (match && match.length >= 3) {
        return [parseInt(match[1]!), parseInt(match[2]!)];
    }
    return null;
}

/**
 * calculate the resulting room name from a given room and a direction
 * @param roomName initial room to calculate the new room from
 * @param direction direction relative to the initial room
 * @returns the resulting room name
 */
export function getRoomNameByDirection(roomName: string, direction: Direction): string | undefined {
    const coordinates = extractCoordinates(roomName);
    if (coordinates) {
        const [x, y] = coordinates;

        return roomName.replace(/([EW])\d+([NS])\d+/, (match, ewDirection, nsDirection) => {
            const isEast = ewDirection == "E";
            const isSouth = nsDirection == "S";

            let newEW = x;
            let newNS = y;

            switch (direction) {
                case Direction.TOP: newNS += (isSouth ? -1 : 1); break;
                case Direction.RIGHT: newEW += isEast ? 1 : -1; break;
                case Direction.BOTTOM: newNS += isSouth ? 1 : -1; break;
                case Direction.LEFT: newEW += isEast ? -1 : 1; break;
            }
            return `${ewDirection}${newEW}${nsDirection}${newNS}`;
        });
    }
    return undefined;
}

/**
 * returns the direction one must move from the first room to reach the second room
 * @param firstRoom 
 * @param secondRoom 
 * @returns 
 */
export function getDirectionFromRooms(firstRoom: string, secondRoom: string): Direction | null {
    const firstCoord = extractCoordinates(firstRoom);
    const secondCoord = extractCoordinates(secondRoom);

    if (firstCoord && secondCoord) {
        const [x1, y1] = firstCoord;
        const [x2, y2] = secondCoord;
        if (x1 == x2 && y1 < y2) return Direction.BOTTOM;
        if (x1 == x2 && y1 > y2) return Direction.TOP;
        if (x1 < x2 && y1 == y2) return Direction.RIGHT;
        if (x1 > x2 && y1 == y2) return Direction.LEFT;
    }
    return null;
}

/**
 * determines if a creep is located directly on the outer border of a room
 * @param creep 
 * @returns 
 */
export function isOnBorder(creep: Creep): boolean {
    return creep.pos.x == 0 || creep.pos.x == 49 || creep.pos.y == 0 || creep.pos.y == 49;
}

/**
 * merges two array and returns the result
 * @param arr1 
 * @param arr2 
 * @returns 
 */
export function mergeArrays<T>(arr1: T[] | undefined, arr2: T[] | undefined): T[] {
    return [...(arr1 || []), ...(arr2 || [])];
}

/**
 * removes a set of items from a given array and returns the resulting array
 * Works only for array containing primitive types
 * @param sourceArray array that may include surplus entries
 * @param entriesToRemove entries that should be removed
 * @returns 
 */
export function removeEntries<T>(sourceArray: T[] | undefined, entriesToRemove: T[] | undefined): T[] {
    // If sourceArray is undefined, return an empty array
    if (!sourceArray) return [];

    // If entriesToRemove is undefined, return a copy of the sourceArray
    if (!entriesToRemove) return [...sourceArray];

    // Perform the removal operation
    return sourceArray.filter(item => !entriesToRemove.includes(item));
}

/**
 * creates a copy of any object
 * @param obj object to create the copy from
 * @returns a copy of the object
 */
export function deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Calculates the sum of a given resource-type over all storage-structures in a given room
 * @param room 
 * @param resource 
 * @returns overall quantity
 */
export function getTotalStorageVolume(room: Room, resource: ResourceConstant): [number, number] {
    const storage = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_STORAGE;
        }
    }) as StructureStorage[];
    return [
        storage.length,
        storage.reduce((sum: number, value: StructureStorage) => {
            return sum + value.store[resource]
        }, 0)
    ];
}

export function getAdjacentRooms(room: Room,): string[] {
    const adjacentRooms: string[] = [];
    const currentRoomInfo = roomInfoMap.get(room.name);
    if (currentRoomInfo) {
        currentRoomInfo.exits.forEach((detail, direction) => {
            if (!detail.blocked) {
                const newName = getRoomNameByDirection(room.name, direction);
                if (newName) {
                    adjacentRooms.push(newName);
                }
            }
        });
    }
    return adjacentRooms;
}

export function getAdjacentHostileRooms(room: Room,): string[] {
    const adjacentRooms: string[] = getAdjacentRooms(room);
    return adjacentRooms.filter((roomName) => {
        return roomInfoMap.get(roomName)?.hostile;
    });
}

export function getCreepsByRole(room: Room, role: Role): Creep[] {
    return room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
            return creep.memory.role == role;
        }
    });
}

export function getCreepsByHome(roomName: string, role?: Role): Creep[] {
    const creeps: Creep[] = [];
    for (const name in Game.creeps) {
        const creep = Game.creeps[name]!;
        if ((role == undefined || creep.memory.role == role) && creep.memory.homeBase == roomName) {
            creeps.push(creep);
        }
    }
    return creeps;
}

export function smallestMissingNumber(numbers: number[]): number {
    // Explicitly type the Set as Set<number>
    const uniqueNumbers = new Set<number>(numbers);

    // Convert Set back to array and sort
    const sortedUniqueNumbers = Array.from(uniqueNumbers).sort((a, b) => a - b);

    // Start checking from 1
    let smallestMissing = 1;

    for (const num of sortedUniqueNumbers) {
        // If we find a number larger than our current smallest missing,
        // we've found our answer
        if (num > smallestMissing) {
            return smallestMissing;
        }

        // Otherwise, update our smallest missing to the next number
        smallestMissing = num + 1;
    }

    // If we've gone through all numbers, return the next number after the largest
    return smallestMissing;
}
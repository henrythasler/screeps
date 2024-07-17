import { Trait } from "./trait";
import { Config } from "./config";
import { Direction } from "./room.info";
import { log } from "./debug";

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

// export function actionAllowed(creep: Creep, roomName: string): boolean {
//     let isOutpost = false;
//     Config.minControllerLevel.forEach((_, baseRoomName) => {
//         isOutpost = isOutpost ? isOutpost : baseRoomName == roomName && baseRoomName != creep.memory.homeBase;
//     });

//     const isHome = roomName == creep.memory.homeBase;
//     return (creep.memory.occupation.includes(Trait.ACTION_HOME) && isHome ||
//         creep.memory.occupation.includes(Trait.ACTION_AWAY) && !isHome && !isOutpost ||
//         creep.memory.occupation.includes(Trait.ACTION_OUTPOST) && !isHome && isOutpost)
// }

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

function extractCoordinates(roomName: string): [number, number] | null {
    const match = roomName.match(/[EW](\d+)[NS](\d+)/);
    if (match && match.length >= 3) {
        return [parseInt(match[1]!), parseInt(match[2]!)];
    }
    return null;
}

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

export function isOnBorder(creep: Creep): boolean {
    return creep.pos.x == 0 || creep.pos.x == 49 || creep.pos.y == 0 || creep.pos.y == 49;
}

export function mergeArrays<T>(arr1: T[] | undefined, arr2: T[] | undefined): T[] {
    return [...(arr1 || []), ...(arr2 || [])];
}

export function removeEntries<T>(sourceArray: T[] | undefined, entriesToRemove: T[] | undefined): T[] {
    // If sourceArray is undefined, return an empty array
    if (!sourceArray) return [];

    // If entriesToRemove is undefined, return a copy of the sourceArray
    if (!entriesToRemove) return [...sourceArray];

    // Perform the removal operation
    return sourceArray.filter(item => !entriesToRemove.includes(item));
}

export function deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

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
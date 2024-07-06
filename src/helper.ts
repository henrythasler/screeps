import { Trait } from "./trait";
import { Config } from "./config";
import { Direction } from "./roominfo";
import { log } from "./debug";

export function isNearHostile(entity: AnyStructure | Creep | Source | Ruin | Resource | Tombstone, hostiles: Creep[]): boolean {
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

export function actionAllowed(creep: Creep, roomName: string): boolean {
    let isOutpost = false;
    Config.minControllerLevel.forEach( (_, baseRoomName) => {
        isOutpost = isOutpost ? isOutpost : baseRoomName == roomName && baseRoomName != creep.memory.homeBase;
    });

    const isHome = roomName == creep.memory.homeBase;
    return (creep.memory.occupation.includes(Trait.ACTION_HOME) && isHome ||
        creep.memory.occupation.includes(Trait.ACTION_AWAY) && !isHome && !isOutpost || 
        creep.memory.occupation.includes(Trait.ACTION_OUTPOST) && !isHome && isOutpost)
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

export function getRoomNameByDirection(room: string, direction: Direction): string | undefined {
    const coordinates = extractCoordinates(room);
    if (coordinates) {
        const [x, y] = coordinates;
        switch (direction) {
            case Direction.TOP: return `E${x}S${y - 1}`;
            case Direction.RIGHT: return `E${x + 1}S${y}`;
            case Direction.BOTTOM: return `E${x}S${y + 1}`;
            case Direction.LEFT: return `E${x - 1}S${y}`;
        }
    }
    return undefined;
}

export function getDirectionFromRooms(firstRoom: string, secondRoom: string): Direction | null {
    const firstCoord = extractCoordinates(firstRoom);
    const secondCoord = extractCoordinates(secondRoom);

    if(firstCoord && secondCoord) {
        const [x1, y1] = firstCoord;
        const [x2, y2] = secondCoord;
        if(x1 == x2 && y1 < y2) return Direction.BOTTOM;
        if(x1 == x2 && y1 > y2) return Direction.TOP;
        if(x1 < x2 && y1 == y2) return Direction.RIGHT;
        if(x1 > x2 && y1 == y2) return Direction.LEFT;
    }
    return null;
}

export function isOnBorder(creep: Creep): boolean {
    return creep.pos.x == 0 || creep.pos.x == 49 || creep.pos.y == 0 || creep.pos.y == 49;
}

import { Trait } from "./trait";
import { Config } from "./config";

export function isNearHostile(entity: AnyStructure | Creep | Source | Ruin | Resource | Tombstone, hostiles: Creep[]): boolean {
    return hostiles.some( (hostile) => {return entity.pos.getRangeTo(hostile.pos) < Config.minHostileDistance});
}

export function countRoomHops(path: RoomPosition[]): number {
    return path.reduce( (hops: string[], pos: RoomPosition) => {
        if(!hops.includes(pos.roomName)) {
            hops.push(pos.roomName);
        }
        return hops;
    }, [] as string[]).length;
}

export function actionAllowed(creep: Creep): boolean {
    return (creep.memory.occupation.includes(Trait.ACTION_LOCAL) && creep.room.name == creep.memory.homeBase ||
    creep.memory.occupation.includes(Trait.ACTION_AWAY) && creep.room.name != creep.memory.homeBase)    
}

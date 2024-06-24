import { Config } from "./config";

export function isNearHostile(entity: AnyStructure | Creep | Source | Ruin | Resource | Tombstone, hostiles: Creep[]): boolean {
    return hostiles.some( (hostile) => {return entity.pos.getRangeTo(hostile.pos) < Config.minHostileDistance});
}
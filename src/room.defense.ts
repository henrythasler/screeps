import { Config } from "./config";
import { log } from "./debug";

export interface HostileCreepInfo {
    count: number,
    hits: number,
    hitsMax: number,
    hostiles: Creep[],
}

export function getHostileCreepInfo(room: Room): HostileCreepInfo {
    const hostiles: Creep[] = room.find(FIND_HOSTILE_CREEPS);
    return {
        count: hostiles.length,
        hits: hostiles.reduce((sum, creep) => sum + creep.hits, 0),
        hitsMax: hostiles.reduce((sum, creep) => sum + creep.hitsMax, 0),
        hostiles: hostiles,
    };
}

export function roomThreatEvaluation(room: Room, hostileCreepInfo: HostileCreepInfo): void {
    if (hostileCreepInfo.count > 0) {
        room.memory.threatLevel += hostileCreepInfo.hits;
        if (hostileCreepInfo.hits > Config.safeModeThreshold) {
            console.log(`[ALERT] ${hostileCreepInfo.count} hostiles (${hostileCreepInfo.hits} hits) in ${room} exceeds limit (${Config.safeModeThreshold}). Triggering Safe Mode!`);
            const res = room.controller?.activateSafeMode();
            if (res != OK) {
                console.log(`[ERROR] in ${room.name}.activateSafeMode(): ${res}`)
            }
        }
    }
    else {
        room.memory.threatLevel = Math.max(0, room.memory.threatLevel - Config.threatLevelCooldown);
    }
}
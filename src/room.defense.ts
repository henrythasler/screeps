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
        room.memory.threatLevel = Math.min(room.memory.threatLevel + hostileCreepInfo.hits, Config.threatLevelMaxValue);
        const controller = room.controller;
        if (hostileCreepInfo.hits > Config.safeModeThreshold && controller && controller.my) {
            log(`[ALERT] ${hostileCreepInfo.count} hostiles (${hostileCreepInfo.hits} hits) in ${room} exceeds limit (${Config.safeModeThreshold}). Triggering Safe Mode!`);
            const res = controller.activateSafeMode();
            if (res != OK) {
                log(`[ERROR] in ${room.name}.activateSafeMode(): ${res}`)
            }
        }
    }
    else {
        room.memory.threatLevel = Math.min(Math.max(0, room.memory.threatLevel - Config.threatLevelCooldown), Config.threatLevelMaxValue);
    }
}
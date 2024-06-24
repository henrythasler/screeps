import { Config } from "./config";

interface Hostiles {
    count: number;
    hits: number;
}

function defendRoom(room: Room, towers: StructureTower[]): Hostiles {

    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    const stats: Hostiles = { count: hostiles.length, hits: 0 };
    if (hostiles.length > 0) {
        const username = hostiles[0].owner.username;
        Game.notify(`User ${username} spotted in room ${room}`);
        towers.forEach(tower => tower.attack(hostiles[0]));
        hostiles.forEach(hostile => stats.hits += hostile.hits);
    }
    return stats;
}

function healCreeps(room: Room, towers: StructureTower[]): void {
    const injuredCreeps: Creep[] = room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
            return creep.hits / creep.hitsMax < Config.creepHealThreshold;  
        }
    });

    if(injuredCreeps.length) {
        // sort by health in ascending order (low health first)
        injuredCreeps.sort((a: Creep, b: Creep): number => {
            return (a.hits - b.hits);
        });
        towers.forEach( (tower, index) => {
            tower.heal(injuredCreeps[0]);
        });
    }
}

function repairStructure(room: Room, towers: StructureTower[]): void {
    const needRepair = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_ROAD ||
                structure.structureType == STRUCTURE_SPAWN ||
                structure.structureType == STRUCTURE_EXTENSION)
                && ((structure.hits / structure.hitsMax) < Config.structureRepairThreshold);
        }
    }) as Structure[];

    if (needRepair.length > 0) {
        needRepair.sort((a: Structure, b: Structure): number => {
            return (a.hits - b.hits);
        });
        towers.forEach(tower => tower.repair(needRepair[0]));
    }
}

function reinforceRamparts(room: Room, towers: StructureTower[], threat: boolean): void {
    const toReinforce = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_RAMPART)
                && ((structure.hits / structure.hitsMax) < (threat ? 0.5: 0.01));
        }
    }) as Structure[];

    if (toReinforce.length > 0) {
        toReinforce.sort((a: Structure, b: Structure): number => {
            return (a.hits - b.hits);
        });
        towers.forEach(tower => tower.repair(toReinforce[0]));
    }
}

export function run(room: Room): void {
        const towers = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }) as StructureTower[];

        if (towers.length > 0) {
            const hostileStats = defendRoom(room, towers);
            reinforceRamparts(room, towers, hostileStats.count > 0);
            if (hostileStats.count == 0) {
                healCreeps(room, towers);
                repairStructure(room, towers);
            }
            else {
                if (hostileStats.hits > Config.safeModeThreshold) {
                    console.log(`[ALERT] ${hostileStats.count} hostiles (${hostileStats.hits} hits) in ${room}`);
                    const res = room.controller?.activateSafeMode();
                    if (res != OK) {
                        console.log(`[ERROR] in ${room.name}.activateSafeMode(): ${res}`)
                    }
                }
            }
        }
}
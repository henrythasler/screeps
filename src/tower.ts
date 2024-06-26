interface Hostiles {
    count: number;
    hits: number;
}

function defendRoom(room: string, towers: StructureTower[]): Hostiles {

    const hostiles = Game.rooms[room].find(FIND_HOSTILE_CREEPS);
    const stats: Hostiles = { count: hostiles.length, hits: 0 };
    if (hostiles.length > 0) {
        const username = hostiles[0].owner.username;
        Game.notify(`User ${username} spotted in room ${room}`);
        towers.forEach(tower => tower.attack(hostiles[0]));
        hostiles.forEach(hostile => stats.hits += hostile.hits);
    }
    return stats;
}

function healCreeps(room: string, towers: StructureTower[]): void {
    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        if (creep.hits < creep.hitsMax) {
            // heal with closest tower
            towers.sort((a: StructureTower, b: StructureTower): number => {
                return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
            });
            towers[0].heal(creep);
        }
    }
}

function repairStructure(room: string, towers: StructureTower[]): void {
    const needRepair = Game.rooms[room].find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_ROAD ||
                structure.structureType == STRUCTURE_SPAWN ||
                structure.structureType == STRUCTURE_CONTAINER ||
                structure.structureType == STRUCTURE_EXTENSION)
                && ((structure.hits / structure.hitsMax) < 0.5);
        }
    }) as Structure[];

    if (needRepair.length > 0) {
        needRepair.sort((a: Structure, b: Structure): number => {
            return (a.hits - b.hits);
        });
        towers.forEach(tower => tower.repair(needRepair[0]));
    }
}

function reinforceRamparts(room: string, towers: StructureTower[], threat: boolean): void {
    const toReinforce = Game.rooms[room].find(FIND_STRUCTURES, {
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

export function run(): void {
    for (const room in Game.rooms) {
        const towers = Game.rooms[room].find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }) as StructureTower[];

        if (towers.length > 0) {
            const hostileStats = defendRoom(room, towers);
            reinforceRamparts(room, towers, hostileStats.count > 0);
            if (hostileStats.count == 0) {
                healCreeps(room, towers);
                repairStructure(room, towers);
            }
            else {
                if (hostileStats.hits > 15000) {
                    console.log(`[ALERT] ${hostileStats.count} hostiles (${hostileStats.hits} hits) in ${room}`);
                    const res = Game.rooms[room].controller?.activateSafeMode();
                    if (res != OK) {
                        console.log(`[ERROR] in ${Game.rooms[room].name}.activateSafeMode(): ${res}`)
                    }
                }
            }
        }
    }
}
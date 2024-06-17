
function defendRoom(room: string, towers: StructureTower[]): number {
    const hostiles = Game.rooms[room].find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
        const username = hostiles[0].owner.username;
        Game.notify(`User ${username} spotted in room ${room}`);
        towers.forEach(tower => tower.attack(hostiles[0]));
    }
    return hostiles.length;
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
                structure.structureType == STRUCTURE_EXTENSION) 
                && ((structure.hits / structure.hitsMax) < 0.5);
        }
    }) as Structure[];

    if(needRepair.length > 0) {
        towers.forEach(tower => tower.repair(needRepair[0]));
    }
}

export function run(): void {
    for (const room in Game.rooms) {
        const towers = Game.rooms[room].find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }) as StructureTower[];

        if(towers.length > 0) {
            const hostiles = defendRoom(room, towers);
            if(hostiles == 0) {
                healCreeps(room, towers);
                repairStructure(room, towers);
            }
        }
    }
}
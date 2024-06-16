
function defendRoom(roomName: string): void {
    const hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
        const username = hostiles[0].owner.username;
        Game.notify(`User ${username} spotted in room ${roomName}`);
        const towers = Game.rooms[roomName].find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }) as StructureTower[];
        towers.forEach(tower => tower.attack(hostiles[0]));
    }
}

function healCreeps(roomName: string): void {
    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        if (creep.hits < creep.hitsMax) {
            const towers = Game.rooms[roomName].find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }) as StructureTower[];
            if (towers.length) {
                // heal with closest tower
                towers.sort((a: StructureTower, b: StructureTower): number => {
                    return (a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos));
                });
                towers[0].heal(creep);
            }
        }
    }
}

export function run(): void {
    for (const room in Game.rooms) {
        defendRoom(room);
        healCreeps(room);
    }
}
export function run(room: Room): void {
    const links = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } }) as StructureLink[];
    const availableSpawns = room.find(FIND_MY_SPAWNS);

    if (availableSpawns.length) {
        const selectedSpawn = availableSpawns[0] ?? null;
        if (selectedSpawn && links.length > 1) {
            // sort by distance
            links.sort((a: StructureLink, b: StructureLink): number => {
                return (a.pos.getRangeTo(selectedSpawn.pos) - b.pos.getRangeTo(selectedSpawn.pos));
            });

            const receiver = links.shift();

            if (receiver && links.length) {
                links.forEach((link) => {
                    link.transferEnergy(receiver);
                });
            }
        }
    }
}
import { Role, Task, roleToString } from "./types";

export function run(minWorker: number) {

    // create an array for all creeps to work with
    const creeps: Creep[] = [];
    for (const name in Game.creeps) {
        creeps.push(Game.creeps[name]);
    }

    // clean up dead creeps
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    // check number of active creeps; spawn a new one if needed
    var numWorker = creeps.filter((creep: Creep) => creep.memory.role == Role.WORKER).length;
    if (numWorker < minWorker) {
        var newName = 'worker' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName,
            {
                memory: {
                    role: Role.WORKER,
                    currentTask: Task.IDLE,
                    taskQueue: [],
                    path: [],
                },
            });
    }

    // show some info about new creep
    if (Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + roleToString(spawningCreep.memory.role),
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            { align: 'left', opacity: 0.8 });
    }
}
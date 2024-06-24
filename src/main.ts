import { EnergyLocation, Role, Species, creepMaintenance } from "./manager.global";
import { Config } from "./config";
import { Task } from "./task";
import { Trait } from "./trait";
import * as spawnManager from "./manager.spawn";
import * as workerManager from "./manager.worker";
import * as scoutManager from "./manager.scout";
import * as collectorManager from "./manager.collector";
import * as roomManager from "./manager.room";
import * as tower from "./tower";
import { RequiredSpecies } from "./manager.spawn";


declare global {
    /*
      Example types, expand on these or remove them and add your own.
      Note: Values, properties defined here do no fully *exist* by this type definiton alone.
            You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)
  
      Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
      Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
    */
    // Memory extension samples
    interface Memory {
        uuid: number,
        log: any,
        sources: Array<Id<Source>>,  // stores the ID of all known sources
    }

    interface CreepMemory {
        speciesName: string,
        role: Role,
        task: Task, // current action that the creep is doing
        traits: Trait[], // potential actions that a creep can perform
        occupation: Trait[],  // subset of traits that a creep is currently allowed to use 
        percentile: number,
        lastChargeSource: EnergyLocation,
        lastEnergyDeposit: EnergyLocation,
        homeBase: string,
    }

    interface SpawnMemory {
    }

    interface RoomMemory {
        buildQueue: RequiredSpecies[],
        ticksWithPendingSpawns: number;
    }

    // Syntax for adding proprties to `global` (ex "global.log")
    namespace NodeJS {
        interface Global {
            log: any,
        }
    }
}

export const loop = () => {
    creepMaintenance();

    for (const roomId in Game.rooms) {
        const room = Game.rooms[roomId];
        tower.run(room);

        room.memory.buildQueue = [];
        const numWorker = workerManager.run(room);  // manage worker population in that room
        spawnManager.run(room); // spawn/heal creeps
        roomManager.run(room);  // execute creep action
    }
/*        
    const numWorker = workerManager.run();
    if (numWorker >= Config.worker.minCount) {
        scoutManager.run();
        collectorManager.run();
    }

    spawnManager.resetBuildQueue();
    for (const name in Game.creeps) {
        const creep = Game.creeps[name];

        if (creep.memory.role == Role.WORKER) {
            worker.run(creep);
        }
        else if (creep.memory.role == Role.SCOUT) {
            scout.run(creep);
        }
        else if (creep.memory.role == Role.COLLECTOR) {
            collector.run(creep);
        }
    }
    spawnManager.run();
*/    
};

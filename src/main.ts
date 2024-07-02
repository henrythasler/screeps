import { Alert, EnergyLocation, Role, creepMaintenance, initializeObjects } from "./manager.global";
import { Task } from "./task";
import { Trait } from "./trait";
import * as spawnManager from "./manager.spawn";
import * as workerManager from "./manager.worker";
import * as scoutManager from "./manager.scout";
import * as collectorManager from "./manager.collector";
import * as harvesterManager from "./manager.harvester";

import * as roomManager from "./manager.room";
import * as tower from "./tower";
import * as link from "./structure.link";
import { RequiredSpecies } from "./manager.spawn";
import { SerializableRoomInfo, loadRoomInfoMap, saveRoomInfoMap } from "./roominfo";
import { Config } from "./config";

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
        knownSources: Array<Id<Source>>,  // stores the ID of all known sources
        knownSpawns: Array<Id<StructureSpawn>>,  // stores the ID of all known sources
        roomInfoMap: { [roomName: string]: SerializableRoomInfo }, //Map<string, RoomInfo>,
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
        alerts: Alert[],
        targetLocation: string | null,
    }

    interface SpawnMemory {
    }

    interface FlagMemory {
    }

    interface RoomMemory {
        buildQueue: RequiredSpecies[],
        ticksWithPendingSpawns: number;
        harvesterPerSource: Map<Id<Source>, number>;
        threatLevel: number;
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
    // initializeObjects();     // use this only to reset global Memory

    loadRoomInfoMap();

    for (const roomId in Game.rooms) {
        const room = Game.rooms[roomId]!;
        tower.run(room);
        link.run(room);

        room.memory.harvesterPerSource = new Map<Id<Source>, number>();

        if(Config.mainBase.includes(room.name)) {
            harvesterManager.run(room);  // manage harvester population in that room
            workerManager.run(room);  // manage worker population in that room
            collectorManager.run(room);  // manage worker population in that room
            scoutManager.run(room);  // manage scout population in that room   
        }

        roomManager.run(room);  // execute creep action
        spawnManager.run(room); // spawn/heal creeps
    }

    saveRoomInfoMap();
};

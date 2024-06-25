import { EnergyLocation, Role, Species } from "./manager.global";
import { Config } from "./config";
import { Task } from "./task";
import { Trait } from "./trait";
import * as spawnManager from "./manager.spawn";
import * as workerManager from "./manager.worker";
import * as scoutManager from "./manager.scout";
import * as collectorManager from "./manager.collector";
import * as worker from "./role.worker";
import * as scout from "./role.scout";
import * as collector from "./role.collector";
import * as tower from "./tower";


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
        sources: string[],  // stores the ID of all known sources
        ticksWithoutSpawn: number,
    }

    interface CreepMemory {
        speciesName?: string,
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
        buildQueue: Species[],
    }

    // Syntax for adding proprties to `global` (ex "global.log")
    namespace NodeJS {
        interface Global {
            log: any,
        }
    }
}

export const loop = () => {
    const numWorker = workerManager.run();
    if (numWorker >= Config.worker.minCount) {
        scoutManager.run();
        collectorManager.run();
    }
    tower.run();

    if((Game.time % 5000) == 0) {
        Game.spawns["Spawn1"].spawnCreep([WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], "agent");
    }
    if (Game.creeps["agent"]) {
        if (Game.creeps["agent"].store.getFreeCapacity() > 0 && Game.creeps["agent"].memory.task == Task.CHARGE) {
            const source = Game.getObjectById("5bbcaf259099fc012e63a3bc") as Source;
            const res = Game.creeps["agent"].harvest(source);
            if (res == ERR_NOT_IN_RANGE) {
                Game.creeps["agent"].moveTo(source);
            }
            else {
                console.log(`harvest: ${res}`);
            }
        }
        else {
            Game.creeps["agent"].memory.task = Task.CHARGE_CONTROLLER;
            const controller = Game.getObjectById("5bbcaf259099fc012e63a3bd") as StructureController;
            const res = Game.creeps["agent"].upgradeController(controller);
            if (res == ERR_NOT_IN_RANGE) {
                Game.creeps["agent"].moveTo(controller);
            }
            else if (res == ERR_NOT_ENOUGH_RESOURCES) {
                Game.creeps["agent"].memory.task = Task.CHARGE;
            }
            else {
                console.log(`upgradeController: ${res}`);
            }
        }
    }

    // Game.creeps["agent"].moveTo(26, 8);
    // Game.creeps["agent"].harvest(Game.getObjectById("5bbcaf259099fc012e63a3bc"))
    // Game.creeps["agent"].moveTo(34, 16);
    // Game.creeps["agent"].upgradeController(Game.getObjectById("5bbcaf259099fc012e63a3bd"))

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
};

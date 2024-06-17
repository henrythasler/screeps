import * as creepManager from "./manager.creeps";
import * as worker from "./role.worker";
import * as tower from "./tower";
import { Role, Task } from "./types";
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
        uuid: number;
        log: any;
        taskQueue: Task[];
    }

    interface CreepMemory {
        role: Role;
        task: Task; // current action that the creep is doing
        traits: Task[]; // potential actions that a creep can perform
        percentile: number;
    }

    // Syntax for adding proprties to `global` (ex "global.log")
    namespace NodeJS {
        interface Global {
            log: any;
        }
    }
}

export const loop = () => {
    creepManager.run(Config.worker.minCountPerRoom);
    tower.run();

    for (const name in Game.creeps) {
        const creep = Game.creeps[name];

        // let workers do their thing
        if (creep.memory.role == Role.WORKER) {
            worker.run(creep);
        }
    }
};

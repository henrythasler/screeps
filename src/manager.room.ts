import { Config } from "./config";
import { EnergyLocation, Role, Species, findMostExpensiveSpecies } from "./manager.global";
import { Task } from "./task";
import { Trait } from "./trait";
import * as worker from "./role.worker";
import * as scout from "./role.scout";
import * as collector from "./role.collector";
import * as harvester from "./role.harvester";
import * as defender from "./role.defender";
import { log, Loglevel } from "./debug";

const runnables: Map<Role, Function> = new Map([
    [Role.WORKER, worker.run],
    // [Role.SCOUT, scout.run],
    // [Role.COLLECTOR, collector.run],
    [Role.HARVESTER, harvester.run],
    // [Role.DEFENDER, defender.run],
]);

export function run(room: Room): void {
    const creeps: Creep[] = room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
            return !creep.spawning;
        }
    });

    creeps.forEach((creep) => {
        const runnable = runnables.get(creep.memory.role);
        if (runnable) {
            runnable(creep);
        }
        else {
            log(`[ERROR] No runnable for ${creep.memory.role}`, Loglevel.ERROR);
        }
    });
}
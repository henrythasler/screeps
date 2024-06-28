import { Config } from "./config";
import { EnergyLocation, Role, Species, findMostExpensiveSpecies } from "./manager.global";
import { Task } from "./task";
import { Trait } from "./trait";
import * as worker from "./role.worker";
import * as scout from "./role.scout";
import * as collector from "./role.collector";
import * as harvester from "./role.harvester";

const runnables: Map<Role, Function> = new Map([
    [Role.WORKER, worker.run],
    [Role.SCOUT, scout.run],
    [Role.COLLECTOR, collector.run],
    [Role.HARVESTER, harvester.run],
]);

function sayAlert(creep: Creep): void {
    creep.say('🏥');
}


export function run(room: Room): void {
    const creeps: Creep[] = room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
            return !creep.spawning;// && creep.memory.homeBase == room.name;
        }
    });

    creeps.forEach((creep) => {
        if (creep.memory.role == Role.WORKER) {
            worker.run(creep);
        }
        else if (creep.memory.role == Role.SCOUT) {
            scout.run(creep);
        }
        else if (creep.memory.role == Role.COLLECTOR) {
            collector.run(creep);
        }
        else if (creep.memory.role == Role.HARVESTER) {
            harvester.run(creep);
        }

    });
}
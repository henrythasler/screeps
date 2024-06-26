import { Config } from "./config";
import { EnergyLocation, Role, Species, findMostExpensiveSpecies } from "./manager.global";
import { Task } from "./task";
import { Trait } from "./trait";
import * as worker from "./role.worker";
import * as scout from "./role.scout";
import * as collector from "./role.collector";


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
    });
}
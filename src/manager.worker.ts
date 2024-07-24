import { Loglevel, log } from "./debug";
import { Config } from "./config";
import { EnergyLocation, Role, roleToString, Species, findMostExpensiveSpecies, managePopulation } from "./manager.global";
import { Task } from "./task";
import { Trait } from "./trait";
import { Location } from "./location";
import { zoo } from "./zoo";

export function run(room: Room, role: Role): void {
    const creeps: Creep[] = room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
            return creep.memory.role == role;
        }
    });

    const minCount = Config.creeps.get(role)?.minCount.get(room.name) ?? 0;
    room.memory.creepCensus.set(role, { current: creeps.length, required: minCount });

    const speciesZoo = zoo.get(role);
    if(speciesZoo) {
        managePopulation(minCount, creeps.length, room, speciesZoo, role);
    }
}
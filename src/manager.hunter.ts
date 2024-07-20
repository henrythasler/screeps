import { log, Loglevel } from "./debug";
import { Config } from "./config";
import { Role, Species, managePopulation, manageTraitDistribution } from "./manager.global";
import { Trait } from "./trait";
import { Location } from "./location";
import { zoo } from "./zoo";

export function run(room: Room, role: Role): void {
    // these creeps can be anywhere, so we just filter by their homebase
    const creeps: Creep[] = [];
    for (const name in Game.creeps) {
        if (Game.creeps[name]!.memory.role == role && Game.creeps[name]!.memory.homeBase == room.name) {
            creeps.push(Game.creeps[name]!);
        }
    }

    const minCount = Config.creeps.get(role)?.minCount.get(room.name) ?? 0;
    room.memory.creepCensus.set(role, { current: creeps.length, required: minCount });

    const speciesZoo = zoo.get(role);
    if(speciesZoo) {
        managePopulation(minCount, creeps.length, room, speciesZoo, role);
    }
}
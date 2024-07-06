import { log, Loglevel } from "./debug";
import { Config } from "./config";
import { Role, Species, managePopulation, manageTraitDistribution } from "./manager.global";
import { Trait } from "./trait";

const zoo: Map<string, Species> = new Map([
    ["HARVESTER_ENTRY", {
        parts: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
        traits: [
            Trait.ACTION_HOME,
            Trait.STORE_ENERGY,
            Trait.STORE_CONTAINER,
            Trait.STORE_STORAGE,
            Trait.STORE_LINK,
            Trait.RENEW_CREEP,
            Trait.HARVEST_SOURCE,
        ],
        cost: 800,
    }],
]);

export function run(room: Room, role: Role): void {
    const creeps: Creep[] = room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
            return creep.memory.role == role;
        }
    });

    const minCount = Config.harvester.minCount.get(room.name) ?? 0;
    room.memory.creepCensus.set(role, {current: creeps.length, required: minCount});

    managePopulation(minCount, creeps.length, room, zoo, role);
    manageTraitDistribution(creeps, zoo, Config.harvester.traitDistribution);
}
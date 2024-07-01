import { log, Loglevel } from "./debug";
import { Config } from "./config";
import { Role, Species, managePopulation, manageTraitDistribution } from "./manager.global";
import { Trait } from "./trait";

const zoo: Map<string, Species> = new Map([
    ["HARVESTER_BASIC", {
        parts: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
        traits: [
            Trait.ACTION_LOCAL,
            Trait.STORE_ENERGY,
            Trait.STORE_CONTAINER,
            Trait.STORE_STORAGE,            
            Trait.RENEW_CREEP,
            Trait.HARVEST_SOURCE,
        ],
        cost: 850,
    }],
]);

export function run(room: Room): void {
    // apply trait distribution
    if ((Game.time % 10) == 0) {
        const creeps: Creep[] = room.find(FIND_MY_CREEPS, {
            filter: (creep) => {
                return creep.memory.role == Role.HARVESTER;
            }
        });

        log(`[${room.name}] harvester: ${creeps.length}/${Config.harvester.minCount}`, Loglevel.INFO);

        managePopulation(Config.harvester.minCount, creeps.length, room, zoo, Role.HARVESTER);
        manageTraitDistribution(creeps, zoo, Config.harvester.traitDistribution);
    }
}
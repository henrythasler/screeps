import { Loglevel, log } from "./debug";
import { Config } from "./config";
import { EnergyLocation, Role, Species, applyTraitDistribution, findMostExpensiveSpecies, managePopulation, manageTraitDistribution } from "./manager.global";
import { Task } from "./task";
import { Trait } from "./trait";
import { Location } from "./location";
import { zoo } from "./zoo";

/*
const collectorZoo: Map<string, Species> = new Map([
    // ["COLLECTOR_TEST", {
    //     parts: [WORK, CARRY, MOVE, MOVE],
    //     traits: [
    //         Trait.CHARGE_AWAY,
    //         Trait.CHARGE_SOURCE,
    //         Trait.STORE_ENERGY,
    //         Trait.SWITCH_ROOM,
    //     ],
    //     cost: 250,
    // }],
    ["COLLECTOR_BASIC", {
        parts: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        traits: new Map([
            [Location.EVERYWHERE,
            [
                Trait.ACTION_AWAY,
                Trait.CHARGE_SOURCE,
                Trait.STORE_ENERGY,
                Trait.STORE_CONTAINER,
                Trait.STORE_STORAGE,
                Trait.SWITCH_ROOM,
                Trait.RENEW_CREEP,
            ]]
        ]),
        cost: 750,
    }],
    ["COLLECTOR_INTERMEDIATE", {
        parts: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        traits: new Map([
            [Location.EVERYWHERE,
            [
                Trait.ACTION_AWAY,
                Trait.ACTION_OUTPOST,
                Trait.CHARGE_SOURCE,
                Trait.BUILD_STRUCTURE,
                Trait.RECHARGE_STRUCTURE,
                Trait.REFRESH_CONTROLLER,
                Trait.STORE_ENERGY,
                Trait.STORE_CONTAINER,
                Trait.STORE_STORAGE,
                Trait.STORE_LINK,
                Trait.SWITCH_ROOM,
                Trait.RENEW_CREEP]
            ],
        ]),
        cost: 1200,
    }],
]);
*/
export function run(room: Room, role: Role): void {
    // these creeps can be anywhere, so we just filter by their homebase
    const creeps: Creep[] = [];
    for (const name in Game.creeps) {
        if (Game.creeps[name].memory.role == role && Game.creeps[name].memory.homeBase == room.name) {
            creeps.push(Game.creeps[name]);
        }
    }

    const minCount = Config.creeps.get(role)?.minCount.get(room.name) ?? 0;
    room.memory.creepCensus.set(role, { current: creeps.length, required: minCount });

    const speciesZoo = zoo.get(role);
    if(speciesZoo) {
        managePopulation(minCount, creeps.length, room, speciesZoo, role);
        // manageTraitDistribution(creeps, zoo, Config.harvester.traitDistribution);   
    }
}
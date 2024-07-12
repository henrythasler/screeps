import { Location } from "./location";
import { Role, Species } from "./manager.global";
import { Trait } from "./trait";

const harvesterDefaultTraits = [
    Trait.HARVEST_SOURCE,
    Trait.STORE_ENERGY,
    Trait.STORE_CONTAINER,
    Trait.STORE_STORAGE,
    Trait.STORE_LINK,
];
const harvester: Map<string, Species> = new Map([
    ["HARVESTER_ENTRY", {
        parts: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
        traits: new Map([
            [Location.HOMEBASE, harvesterDefaultTraits]
        ]),
        cost: 800,
    }],
    ["HARVESTER_BASIC", {
        parts: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
        traits: new Map([
            [Location.HOMEBASE, harvesterDefaultTraits]
        ]),
        cost: 900,
    }],
]);


const workerDefaultTraits = [
    Trait.CHARGE_STORAGE,
    Trait.CHARGE_CONTAINER,
    Trait.CHARGE_LINK,
    Trait.STORE_ENERGY,
    Trait.STORE_CONTAINER,
    Trait.STORE_STORAGE,
    Trait.REPAIR_STRUCTURE,
    Trait.RECHARGE_STRUCTURE,
    Trait.UPGRADE_CONTROLLER,
    Trait.BUILD_STRUCTURE,
    Trait.REFRESH_CONTROLLER,
]
const worker: Map<string, Species> = new Map([
    ["WORKER_ENTRY", {
        parts: [WORK, CARRY, CARRY, MOVE, MOVE],
        traits: new Map([
            [Location.EVERYWHERE, [...workerDefaultTraits, ...[Trait.CHARGE_SOURCE]]],
        ]),
        cost: 300,
    }],
    ["WORKER_ENTRY_HEAVY", {
        parts: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        traits: new Map([
            [Location.EVERYWHERE, [...workerDefaultTraits, ...[Trait.CHARGE_SOURCE]]],
        ]),
        cost: 400,
    }],
    ["WORKER_BASIC_SLOW", {
        parts: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE],
        traits: new Map([
            [Location.EVERYWHERE, [...workerDefaultTraits, ...[Trait.CHARGE_SOURCE]]],
            ]),
        cost: 550,
    }],
    ["WORKER_BASIC", {
        parts: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
        traits: new Map([
            [Location.EVERYWHERE, [...workerDefaultTraits, ...[Trait.CHARGE_SOURCE]]],
            ]),
        cost: 600,
    }],
    ["WORKER_BASIC_FAST", {
        parts: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        traits: new Map([
            [Location.EVERYWHERE, [...workerDefaultTraits, ...[Trait.CHARGE_SOURCE]]],
            ]),
        cost: 700,
    }],
    ["WORKER_BASIC_HEAVY", {
        parts: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        traits: new Map([
            [Location.EVERYWHERE, [...workerDefaultTraits, ...[Trait.CHARGE_SOURCE]]],
            ]),
        cost: 800,
    }],
    ["WORKER_INTERMEDIATE", {
        parts: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        traits: new Map([
            [Location.EVERYWHERE, workerDefaultTraits],
            ]),
        cost: 1200,
    }],
]);

export const zoo: Map<Role, Map<string, Species>> = new Map([
    [Role.HARVESTER, harvester],
    [Role.WORKER, worker],
]);
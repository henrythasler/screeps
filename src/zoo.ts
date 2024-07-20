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
            [Location.HOME, harvesterDefaultTraits]
        ]),
        cost: 800,
    }],
    ["HARVESTER_BASIC", {
        parts: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
        traits: new Map([
            [Location.HOME, harvesterDefaultTraits]
        ]),
        cost: 900,
    }],
]);


const workerDefaultTraits = [
    Trait.CHARGE_STORAGE,
    Trait.CHARGE_CONTAINER,
    Trait.CHARGE_LINK,
    Trait.GATHER_RESOURCE,
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
            [Location.HOME, [...workerDefaultTraits, ...[Trait.HARVEST_SOURCE]]],
        ]),
        cost: 300,
    }],
    ["WORKER_ENTRY_HEAVY", {
        parts: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        traits: new Map([
            [Location.HOME, [...workerDefaultTraits, ...[Trait.HARVEST_SOURCE]]],
        ]),
        cost: 400,
    }],
    ["WORKER_BASIC_SLOW", {
        parts: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE],
        traits: new Map([
            [Location.HOME, [...workerDefaultTraits, ...[Trait.HARVEST_SOURCE]]],
        ]),
        cost: 550,
    }],
    ["WORKER_BASIC", {
        parts: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
        traits: new Map([
            [Location.HOME, [...workerDefaultTraits, ...[Trait.HARVEST_SOURCE]]],
        ]),
        cost: 600,
    }],
    ["WORKER_BASIC_FAST", {
        parts: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        traits: new Map([
            [Location.HOME, [...workerDefaultTraits, ...[Trait.HARVEST_SOURCE]]],
        ]),
        cost: 700,
    }],
    ["WORKER_BASIC_HEAVY", {
        parts: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        traits: new Map([
            [Location.HOME, [...workerDefaultTraits, ...[Trait.HARVEST_SOURCE]]],
        ]),
        cost: 800,
    }],
    ["WORKER_INTERMEDIATE", {
        parts: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        traits: new Map([
            [Location.HOME, workerDefaultTraits],
        ]),
        cost: 1200,
    }],
]);

const scoutDefaultTraits = [Trait.RECON_ROOM, Trait.SWITCH_ROOM];
const scout: Map<string, Species> = new Map([
    ["SCOUT_ENTRY", {
        parts: [MOVE],
        traits: new Map([
            [Location.EVERYWHERE, scoutDefaultTraits],
        ]),
        cost: 50,
    }],
    ["SCOUT_BASIC", {
        parts: [CLAIM, MOVE],
        traits: new Map([
            [Location.EVERYWHERE, scoutDefaultTraits],
            [Location.REMOTE, [Trait.CLAIM_CONTROLLER, Trait.RESERVE_CONTROLLER]],
            [Location.RESERVED, [Trait.CLAIM_CONTROLLER, Trait.RESERVE_CONTROLLER]],
        ]),
        cost: 650,
    }],
]);


const collector: Map<string, Species> = new Map([
    // ["COLLECTOR_BASIC", {
    //     parts: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
    //     traits: new Map([
    //         [Location.EVERYWHERE,
    //         [
    //             Trait.HARVEST_SOURCE,
    //             Trait.STORE_ENERGY,
    //             Trait.STORE_CONTAINER,
    //             Trait.STORE_STORAGE,
    //             Trait.SWITCH_ROOM,
    //             Trait.RENEW_CREEP,
    //         ]]
    //     ]),
    //     cost: 750,
    // }],
    ["COLLECTOR_INTERMEDIATE", {
        parts: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        traits: new Map([
            [Location.EVERYWHERE, [Trait.SWITCH_ROOM]],
            [Location.HOME, [Trait.STORE_ENERGY, Trait.STORE_LINK, Trait.STORE_CONTAINER, Trait.STORE_STORAGE]],
            [Location.REMOTE, [Trait.HARVEST_SOURCE, Trait.GATHER_RESOURCE, Trait.BUILD_STRUCTURE]],
            [Location.RESERVED, [Trait.HARVEST_SOURCE, Trait.GATHER_RESOURCE, Trait.BUILD_STRUCTURE]],
            [Location.OUTPOST, [Trait.HARVEST_SOURCE, Trait.GATHER_RESOURCE, Trait.BUILD_STRUCTURE, Trait.REFRESH_CONTROLLER, Trait.UPGRADE_CONTROLLER, Trait.RECHARGE_STRUCTURE]],
        ]),
        cost: 1200,
    }],
]);


const defender: Map<string, Species> = new Map([
    ["DEFENDER_ENTRY", {
        parts: [MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK],
        traits: new Map([
            [Location.HOME, [
                Trait.ATTACK_HOSTILE,
            ]]
        ]),
        cost: 520,
    }],
]);

export const zoo: Map<Role, Map<string, Species>> = new Map([
    [Role.HARVESTER, harvester],
    [Role.WORKER, worker],
    [Role.SCOUT, scout],
    [Role.COLLECTOR, collector],
    [Role.DEFENDER, defender],
]);
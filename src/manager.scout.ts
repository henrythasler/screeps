import { log, Loglevel } from "./debug";
import { Config } from "./config";
import { Role, Species, managePopulation, manageTraitDistribution } from "./manager.global";
import { Trait } from "./trait";

const bodyPartCosts: Map<BodyPartConstant, number> = new Map([
    [MOVE, 50],
    [WORK, 100],
    [CARRY, 50],
    [ATTACK, 80],
    [RANGED_ATTACK, 150],
    [HEAL, 250],
    [CLAIM, 600],
    [TOUGH, 10],
]);

const zoo: Map<string, Species> = new Map([
    ["SCOUT_ENTRY", {
        parts: [MOVE],
        traits: [
            Trait.SWITCH_ROOM,
            Trait.RECON_ROOM,
            Trait.SCOUT_ROOMS,
        ],
        cost: 50,
    }],
    // ["SCOUT_BASIC", { 
    //     parts: [CLAIM, WORK, CARRY, MOVE, MOVE],
    //     traits: [
    //         Trait.CHARGE_AWAY,
    //         Trait.CHARGE_STORAGE,
    //         Trait.CHARGE_CONTAINER,
    //         Trait.CHARGE_SOURCE,
    //         Trait.CLAIM_CONTROLLER,
    //         Trait.RESERVE_CONTROLLER,
    //         Trait.SWITCH_ROOM,    
    //         Trait.RECON_ROOM,
    //         Trait.SCOUT_ROOMS,
    //     ],
    //     cost: 800,
    // }],    
]);

export function run(room: Room, role: Role): void {
    // these creeps can be anywhere, so we just filter by their homebase
    const creeps: Creep[] = [];
    for (const name in Game.creeps) {
        if (Game.creeps[name]!.memory.role == role && Game.creeps[name]!.memory.homeBase == room.name) {
            creeps.push(Game.creeps[name]!);
        }
    }

    const minCount = Config.scout.minCount.get(room.name) ?? 0;
    room.memory.creepCensus.set(role, {current: creeps.length, required: minCount});

    managePopulation(minCount, creeps.length, room, zoo, role);
    manageTraitDistribution(creeps, zoo, Config.scout.traitDistribution);
}

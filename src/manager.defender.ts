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
    ["DEFENDER_BASIC", {
        parts: [ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE],
        traits: [
            Trait.ACTION_HOME,
            Trait.ACTION_OUTPOST,
            Trait.SWITCH_ROOM,
            Trait.ATTACK_HOSTILE,
        ],
        cost: 520,
    }],
]);

export function run(room: Room, role: Role): void {
    // these creeps can be anywhere, so we just filter by their homebase
    const creeps: Creep[] = [];
    for (const name in Game.creeps) {
        if (Game.creeps[name]!.memory.role == role && Game.creeps[name]!.memory.homeBase == room.name) {
            creeps.push(Game.creeps[name]!);
        }
    }

    const minCount = Config.defender.minCount.get(room.name) ?? 0;
    room.memory.creepCensus.set(role, { current: creeps.length, required: minCount });

    managePopulation(minCount, creeps.length, room, zoo, role);
    manageTraitDistribution(creeps, zoo, Config.defender.traitDistribution);
}

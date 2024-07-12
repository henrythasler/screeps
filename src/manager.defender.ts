import { log, Loglevel } from "./debug";
import { Config } from "./config";
import { Role, Species, managePopulation, manageTraitDistribution } from "./manager.global";
import { Trait } from "./trait";
import { HostileCreepInfo } from "./room.defense";
import { Location } from "./location";
import { zoo } from "./zoo";

/*
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
        parts: [MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK],
        traits: new Map([
            [Location.EVERYWHERE, [
                Trait.ACTION_HOME,
                Trait.ACTION_OUTPOST,
                Trait.SWITCH_ROOM,
                Trait.ATTACK_HOSTILE,
            ]]
        ]),
        cost: 520,
    }],
    ["DEFENDER_BASIC_HEAVY", {
        parts: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
        traits: new Map([
            [Location.EVERYWHERE, [
                Trait.ACTION_HOME,
                Trait.ACTION_OUTPOST,
                Trait.SWITCH_ROOM,
                Trait.ATTACK_HOSTILE,
            ]]
        ]),
        cost: 860,
    }],
]);
*/
export function run(room: Room, role: Role, hostileCreepInfo: HostileCreepInfo): void {
    // these creeps can be anywhere, so we just filter by their homebase
    const creeps: Creep[] = [];
    for (const name in Game.creeps) {
        if (Game.creeps[name]!.memory.role == role && Game.creeps[name]!.memory.homeBase == room.name) {
            creeps.push(Game.creeps[name]!);
        }
    }

    let minCount = Config.creeps.get(role)?.minCount.get(room.name) ?? 0;

    // add more defender the higher the threat-level is
    minCount += Math.floor(room.memory.threatLevel / Config.threatLevelDefenderThreshold) * Config.additionalDefender;

    room.memory.creepCensus.set(role, { current: creeps.length, required: minCount });

    const speciesZoo = zoo.get(role);
    if(speciesZoo) {
        managePopulation(minCount, creeps.length, room, speciesZoo, role);
        // manageTraitDistribution(creeps, zoo, Config.harvester.traitDistribution);   
    }
}

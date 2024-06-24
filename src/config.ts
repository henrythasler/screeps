import { Task } from "./task";
import { Trait } from "./trait";

class Worker {
    static minCount = 2;
    static traitDistribution: Map<Trait, number> = new Map([
        [Trait.CHARGE_LOCAL, 1],
        [Trait.CHARGE_SOURCE, 1],
        [Trait.CHARGE_STORAGE, 1],
        [Trait.RECHARGE_STRUCTURE, 0.75],
        [Trait.RECHARGE_CONTROLLER, 1],
        [Trait.BUILD_STRUCTURE, 1],
        [Trait.STORE_ENERGY, 1],
        [Trait.REPAIR_STRUCTURE, 0.5],
        [Trait.REFRESH_CONTROLLER, 0],
    ]);
}

class Scout {
    static minCount = 1;
    static availableTraits: Trait[] = [
        Trait.CHARGE_SOURCE,
        Trait.CHARGE_AWAY,
        Trait.CHARGE_STORAGE,
        Trait.CLAIM_CONTROLLER,
        Trait.RESERVE_CONTROLLER,
        Trait.SWITCH_ROOM,
        Trait.RECON_ROOM,
    ];
    static traitDistribution: Map<Trait, number> = new Map([
        [Trait.CHARGE_SOURCE, 1],
        [Trait.CHARGE_AWAY, 1],
        [Trait.CHARGE_STORAGE, 0],
        [Trait.CLAIM_CONTROLLER, 0],
        [Trait.RESERVE_CONTROLLER, 1],
        [Trait.SWITCH_ROOM, 1],
        [Trait.RECON_ROOM, 1],
    ]);
}

class Collector {
    static minCount = 0;
    static availableTraits: Trait[] = [
        Trait.CHARGE_SOURCE,
        Trait.CHARGE_AWAY,
        Trait.STORE_ENERGY,
        Trait.SWITCH_ROOM,
    ];
    static traitDistribution: Map<Trait, number> = new Map([
        [Trait.CHARGE_SOURCE, 1],
        [Trait.CHARGE_AWAY, 1],
        [Trait.STORE_ENERGY, 1],
        [Trait.SWITCH_ROOM, 1],
    ]);       
}

export class Config {
    static minControllerLevel = 5;

    static creepHealThreshold = 0.8; // ratio of hits/hitsMax that, if falling below the given threshold, triggers creep healing
    static structureRepairThreshold = 0.8; // ratio of hits/hitsMax that, if falling below the given threshold, triggers repair

    static safeModeThreshold = 15_000;  // total sum of hitpoints of all hostiles per room to trigger safe-mode

    static worker = Worker;
    static scout = Scout;
    static collector = Collector;
}

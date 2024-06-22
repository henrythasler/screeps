import { Task } from "./task";
import { Trait } from "./trait";

class Worker {
    static minCountPerRoom = 12;
    static availableTraits: Trait[] = [
        Trait.CHARGE_LOCAL,
        Trait.CHARGE_SOURCE,
        Trait.CHARGE_STORAGE,
        Trait.RECHARGE_STRUCTURE,
        Trait.RECHARGE_CONTROLLER,
        Trait.BUILD_STRUCTURE,
        Trait.STORE_ENERGY,
        Trait.REPAIR_STRUCTURE,
        Trait.REFRESH_CONTROLLER,
    ];
    static traitDistribution: Map<Trait, number> = new Map([
        [Trait.CHARGE_LOCAL, 1],
        [Trait.CHARGE_SOURCE, 1],
        [Trait.CHARGE_STORAGE, 1],
        [Trait.RECHARGE_STRUCTURE, 0.5],
        [Trait.RECHARGE_CONTROLLER, 1],
        [Trait.BUILD_STRUCTURE, 1],
        [Trait.STORE_ENERGY, 1],
        [Trait.REPAIR_STRUCTURE, 0.5],
        [Trait.REFRESH_CONTROLLER, 0.2],
    ]);
}

class Scout {
    static minCountPerRoom = 0;
    static availableTraits: Trait[] = [
        Trait.CHARGE_SOURCE,
        Trait.CHARGE_STORAGE,
        Trait.CLAIM_CONTROLLER,
        Trait.RESERVE_CONTROLLER,
        Trait.SWITCH_ROOM,
    ];
    static traitDistribution: Map<Trait, number> = new Map([
        [Trait.CHARGE_SOURCE, 1],
        [Trait.CHARGE_STORAGE, 1],
        [Trait.CLAIM_CONTROLLER, 1],
        [Trait.RESERVE_CONTROLLER, 1],
        [Trait.SWITCH_ROOM, 1],
    ]);
}

class Collector {
    static minCount = 8;
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
    static worker = Worker;
    static scout = Scout;
    static collector = Collector;
}

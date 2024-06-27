import { Task } from "./task";
import { Trait } from "./trait";

class Worker {
    static minCount = 12;
    static traitDistribution: Map<Trait, number> = new Map([
        [Trait.CHARGE_LOCAL, 1],
        [Trait.CHARGE_SOURCE, 0],
        [Trait.CHARGE_STORAGE, 1],
        [Trait.RECHARGE_STRUCTURE, 0.5],
        [Trait.RECHARGE_CONTROLLER, 1],
        [Trait.BUILD_STRUCTURE, 1],
        [Trait.STORE_ENERGY, 1],
        [Trait.REPAIR_STRUCTURE, 0.5],
        [Trait.REFRESH_CONTROLLER, 0.2],
        [Trait.RENEW_CREEP, 1],
    ]);
}

class Scout {
    static minCount = 0;
    static traitDistribution: Map<Trait, number> = new Map([
        [Trait.CHARGE_SOURCE, 1],
        [Trait.CHARGE_AWAY, 1],
        [Trait.CHARGE_STORAGE, 0],
        [Trait.CLAIM_CONTROLLER, 0],
        [Trait.RESERVE_CONTROLLER, 1],
        [Trait.SWITCH_ROOM, 1],
        [Trait.RECON_ROOM, 1],
        [Trait.RENEW_CREEP, 1],
    ]);
}

class Collector {
    static minCount = 4;
    static traitDistribution: Map<Trait, number> = new Map([
        [Trait.CHARGE_SOURCE, 1],
        [Trait.CHARGE_AWAY, 1],
        [Trait.STORE_ENERGY, 1],
        [Trait.SWITCH_ROOM, 1],
        [Trait.RENEW_CREEP, 1],
    ]);       
}

class Harvester {
    static minCount = 1;
    static traitDistribution: Map<Trait, number> = new Map([
        [Trait.CHARGE_LOCAL, 1],
        [Trait.CHARGE_SOURCE, 1],
        [Trait.STORE_ENERGY, 1],
        [Trait.RENEW_CREEP, 1],
    ]);       
}

export class Config {
    // Controller
    static minControllerLevel = 6;
    static minControllerRefreshTicksRatio = 0.5; // ratio based on downgradeTicksPerLevel that triggers a controller refresh action

    static creepRenewThreshold = 1500 * 0.5; // 
    static creepRenewMax = 1500 * 0.9; // 
    static spawnRenewMinEnergy = 0.8;  // min energy needed to be able to renew spawns
    static spawnDryRun = true; // enabled dry-run does not actually spawn a creep
    static creepHealThreshold = 0.8; // ratio of hits/hitsMax that, if falling below the given threshold, triggers creep healing
    static structureTowerRepairThreshold = 0.5; // ratio of hits/hitsMax that, if falling below the given threshold, triggers repair by towers
    static structureWorkerRepairThreshold = 0.4; // ratio of hits/hitsMax that, if falling below the given threshold, triggers repair by workers

    static rampartTowerRepairThresholdPeace = 0.01;
    static rampartTowerRepairThresholdThreat = 0.5;

    static safeModeThreshold = 15_000;  // total sum of hitpoints of all hostiles per room to trigger safe-mode

    static tombstoneMaxDistance = 10;   // max linear distance to travel for resource pickup
    static ruinMaxDistance = 10;   // max linear distance to travel for resource pickup
    static resourcePickupMaxDistance = 10;  // max linear distance to travel for resource pickup
    static minHostileDistance = 10; // min linear distance that non-combatants must keep from hostiles

    static worker = Worker;
    static scout = Scout;
    static collector = Collector;
    static harvester = Harvester;
}

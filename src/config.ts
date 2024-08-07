import { Role } from "./manager.global";
import { Task } from "./task";
import { Trait } from "./trait";

/*
class Worker {
    static minCount = new Map<string, number>([
        ["sim", 8],
        ["E37S37", 6],
        ["E37S38", 6],
        ["W14N19", 8],  // Newbie Land
    ]);    
    static traitDistribution: Map<Trait, number> = new Map([
        [Trait.ACTION_HOME, 1],
        [Trait.CHARGE_SOURCE, 1],
        [Trait.CHARGE_CONTAINER, 1],
        [Trait.CHARGE_STORAGE, 1],
        [Trait.CHARGE_LINK, 1],
        [Trait.RECHARGE_STRUCTURE, 0.75],
        [Trait.RECHARGE_CONTROLLER, 1],
        [Trait.BUILD_STRUCTURE, 1],
        [Trait.STORE_ENERGY, 1],
        [Trait.STORE_STORAGE, 1],
        [Trait.REPAIR_STRUCTURE, 0.5],
        [Trait.REFRESH_CONTROLLER, 0.2],
        [Trait.RENEW_CREEP, 0],
    ]);
}

class Scout {
    static minCount = new Map<string, number>([
        ["sim", 0],
        ["E37S37", 0],
        ["E37S38", 1],
        ["W14N19", 0],  // Newbie Land
    ]);
    static traitDistribution: Map<Trait, number> = new Map([
        [Trait.CHARGE_SOURCE, 0],
        [Trait.ACTION_AWAY, 0],
        [Trait.CHARGE_STORAGE, 0],
        [Trait.CHARGE_CONTAINER, 0],
        [Trait.CLAIM_CONTROLLER, 0],
        [Trait.RESERVE_CONTROLLER, 1],
        [Trait.SWITCH_ROOM, 1],
        [Trait.RECON_ROOM, 1],
        [Trait.SCOUT_ROOMS, 1],
        [Trait.RENEW_CREEP, 0],
    ]);
}

class Collector {
    static minCount = new Map<string, number>([
        ["sim", 4],
        ["E37S37", 0],
        ["E37S38", 4],
        ["W14N19", 4],  // Newbie Land
    ]);
    static traitDistribution: Map<Trait, number> = new Map([
        [Trait.ACTION_AWAY, 1],
        [Trait.ACTION_OUTPOST, 0],
        [Trait.CHARGE_SOURCE, 1],
        [Trait.STORE_ENERGY, 1],
        [Trait.STORE_CONTAINER, 1],
        [Trait.STORE_STORAGE, 0],
        [Trait.STORE_LINK, 1],
        [Trait.BUILD_STRUCTURE, 1],
        [Trait.RECHARGE_STRUCTURE, 0],
        [Trait.REFRESH_CONTROLLER, 0],
        [Trait.SWITCH_ROOM, 1],
        [Trait.RENEW_CREEP, 0],
    ]);
}

class Harvester {
    static minCount = new Map<string, number>([
        ["sim", 2],
        ["E37S37", 2],
        ["E37S38", 2],
        ["W14N19", 2],  // Newbie Land
    ]);
    static traitDistribution: Map<Trait, number> = new Map([
        [Trait.ACTION_HOME, 1],
        [Trait.HARVEST_SOURCE, 1],
        [Trait.STORE_ENERGY, 1],
        [Trait.STORE_CONTAINER, 1],
        [Trait.STORE_STORAGE, 1],
        [Trait.STORE_LINK, 1],
        [Trait.RENEW_CREEP, 0],
    ]);
}

class Defender {
    static minCount = new Map<string, number>([
        ["sim", 0],
        ["E37S37", 0],
        ["E37S38", 0],
        ["W14N19", 1],  // Newbie Land
    ]);
    static traitDistribution: Map<Trait, number> = new Map([
        [Trait.ACTION_HOME, 1],
        [Trait.ATTACK_HOSTILE, 1],
    ]);
}
*/

interface CreepConfig {
    minCount: Map<string, number>;
    [key: string]: any;
}

const harvesterConfig: CreepConfig = {
    minCount: new Map<string, number>([
        ["sim", 0],
        ["E37S37", 2],
        ["E37S38", 2],
        ["E36S38", 2],
        ["W14N19", 2],  // Newbie Land
        ["W14N18", 2],  // Newbie Land
    ]),
}

const workerConfig: CreepConfig = {
    minCount: new Map<string, number>([
        ["sim", 2],
        ["E37S37", 6],
        ["E37S38", 6],
        ["E36S38", 6],
        ["W14N19", 8],  // Newbie Land
        ["W14N18", 4],  // Newbie Land
    ]),
}

const scoutConfig: CreepConfig = {
    minCount: new Map<string, number>([
        ["sim", 0],
        ["E37S37", 0],
        ["E37S38", 1],
        ["W14N19", 1],  // Newbie Land
    ]),
}

const collectorConfig: CreepConfig = {
    minCount: new Map<string, number>([
        ["sim", 0],
        ["E37S37", 0],
        ["E37S38", 2],
        ["E36S38", 2],
        ["W14N19", 8],  // Newbie Land
        ["W14N18", 6],  // Newbie Land
    ]),
    maxHops: 1,
}

const defenderConfig: CreepConfig = {
    minCount: new Map<string, number>([
        ["sim", 0],
        ["E37S37", 0],
        ["E37S38", 0],
        ["W14N19", 0],  // Newbie Land
        ["W14N18", 0],  // Newbie Land
    ]),
}

export class Config {
    static userName = "null-ptr";
    // Controller
    static minControllerLevel = new Map<string, number>([
        ["sim", 4],
        ["E37S37", 7],
        ["E37S38", 6],
        ["E36S38", 3],
        ["W14N19", 8],  // Newbie Land
        ["W14N18", 6],  // Newbie Land
    ]);
    static minControllerRefreshTicksRatio = 0.5; // ratio based on downgradeTicksPerLevel that triggers a controller refresh action

    static spawnManagerInterval = 11; // Ticks
    static resetBuildQueueTimeout = 300; // Ticks
    static creepRenewThreshold = 1500 * 0.2; // 
    static creepRenewMax = 1500 * 0.9; // 
    static spawnRenewMinEnergy = 0.8;  // min energy needed to be able to renew spawns
    static spawnDryRun = false; // enabled dry-run does not actually spawn a creep
    static creepHealThreshold = 1; // ratio of hits/hitsMax that, if falling below the given threshold, triggers creep healing
    static structureTowerRepairThreshold = 0.5; // ratio of hits/hitsMax that, if falling below the given threshold, triggers repair by towers
    static structureWorkerRepairThreshold = 0.4; // ratio of hits/hitsMax that, if falling below the given threshold, triggers repair by workers
    static idleTickThreshold = 10;
    static minStorageEnergy = 10000; // how much energy is at least conserved in local storages before structures will be upgraded or reinforced

    static rampartTowerRepairThresholdPeace = 0.1;
    static rampartTowerRepairThresholdThreat = 0.5;

    static wallTowerRepairThresholdPeace = 0.01;
    static wallTowerRepairThresholdThreat = 0.05;

    static threatLevelStructureReinforcementThreshold = 50_000;   // triggers reinforcement of structures
    static threatLevelDefenderThreshold = 150_000;   // triggers spawning of defender creeps
    static additionalDefender = 1;   // add that many defender per threatLevelDefenderThreshold
    static safeModeThreshold = 16_000;  // total sum of hitpoints of all hostiles per room to trigger safe-mode
    static threatLevelCooldown = 4_000;

    static tombstoneGatherFactor = 0.08;   // max linear distance to travel for resource pickup
    static ruinMaxDistance = 10;   // max linear distance to travel for resource pickup
    static resourcePickupMaxDistance = 10;  // max linear distance to travel for resource pickup
    static minHostileDistance = 10; // min linear distance that non-combatants must keep from hostiles

    static linkChargeMaxDistance = 10;

    static visualizePathOpacity = 1;
    static visualizePathStrokeWidth = 0.05;
    static visualizePathStyle = new Map<Task, PolyStyle>([
        [Task.HARVEST, { stroke: '#ffff00', opacity: Config.visualizePathOpacity, strokeWidth: Config.visualizePathStrokeWidth }],
        [Task.STORE_ENERGY, { stroke: '#808080', opacity: Config.visualizePathOpacity, strokeWidth: Config.visualizePathStrokeWidth }],
        [Task.CHARGE, { stroke: '#808000', opacity: Config.visualizePathOpacity, strokeWidth: Config.visualizePathStrokeWidth }],
        [Task.UPGRADE_CONTROLLER, { stroke: '#008000', opacity: Config.visualizePathOpacity, strokeWidth: Config.visualizePathStrokeWidth }],
        [Task.CHARGE_STRUCTURE, { stroke: '#00ff00', opacity: Config.visualizePathOpacity, strokeWidth: Config.visualizePathStrokeWidth }],
        [Task.BUILD_STRUCTURE, { stroke: '#00ffff', opacity: Config.visualizePathOpacity, strokeWidth: Config.visualizePathStrokeWidth }],
        [Task.GATHER, { stroke: '#ff00ff', opacity: Config.visualizePathOpacity, strokeWidth: Config.visualizePathStrokeWidth }],
        [Task.SWITCH_ROOM, { stroke: '#ff8000', opacity: Config.visualizePathOpacity, strokeWidth: Config.visualizePathStrokeWidth }],
        [Task.RESERVE_CONTROLLER, { stroke: '#ffffff', opacity: Config.visualizePathOpacity, strokeWidth: Config.visualizePathStrokeWidth }],
        [Task.CLAIM_CONTROLLER, { stroke: '#800080', opacity: Config.visualizePathOpacity, strokeWidth: Config.visualizePathStrokeWidth }],
        [Task.ATTACK_HOSTILE, { stroke: '#ff0000', opacity: Config.visualizePathOpacity, strokeWidth: Config.visualizePathStrokeWidth }],
    ]);

    static harvestSourceRegenerationThreshold = 60;   // ticks to wait for regen

    static scoutRoomReconCooldownNeutral = 120;
    static scoutRoomReconCooldownHostile = 600;
    static roomReconVisuals = true;

    static creeps: Map<Role, CreepConfig> = new Map<Role, CreepConfig>([
        [Role.HARVESTER, harvesterConfig],
        [Role.WORKER, workerConfig],
        [Role.SCOUT, scoutConfig],
        [Role.COLLECTOR, collectorConfig],
        [Role.DEFENDER, defenderConfig],
    ]);
}

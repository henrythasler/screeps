import { Config } from "./config";
import { getTotalStorageVolume } from "./helper";
import { HostileCreepInfo } from "./room.defense";

function defendRoom(towers: StructureTower[], hostileCreepInfo: HostileCreepInfo): void {
    const hostiles = hostileCreepInfo.hostiles;
    if (hostiles.length > 0) {
        hostiles.sort((a: Creep, b: Creep): number => {
            return (a.hits - b.hits);
        });
        towers.forEach(tower => tower.attack(hostiles[0]));
    }
}

function healCreeps(room: Room, towers: StructureTower[]): boolean {
    const injuredCreeps: Creep[] = room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
            return creep.hits / creep.hitsMax < Config.creepHealThreshold;
        }
    });

    if (injuredCreeps.length) {
        // sort by health in ascending order (low health first)
        injuredCreeps.sort((a: Creep, b: Creep): number => {
            return (a.hits - b.hits);
        });
        towers.forEach((tower, index) => {
            tower.heal(injuredCreeps[0]);
        });
        return true;
    }
    return false;
}

function repairStructure(room: Room, towers: StructureTower[]): boolean {
    const needRepair = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_ROAD ||
                structure.structureType == STRUCTURE_SPAWN ||
                structure.structureType == STRUCTURE_TOWER ||
                structure.structureType == STRUCTURE_CONTAINER ||
                structure.structureType == STRUCTURE_EXTENSION)
                && structure.hits < Config.structureTowerRepairThreshold * structure.hitsMax;
        }
    }) as Structure[];

    if (needRepair.length > 0) {
        needRepair.sort((a: Structure, b: Structure): number => {
            return (a.hits - b.hits);
        });
        towers.forEach(tower => tower.repair(needRepair[0]));
        return true;
    }
    return false;
}

type ReinforcableStructures = STRUCTURE_RAMPART | STRUCTURE_WALL;

function reinforceStructure(room: Room, towers: StructureTower[], structureToReinforce: ReinforcableStructures, minHits: number): void {
    const [storages, volume] = getTotalStorageVolume(room, RESOURCE_ENERGY);
    if (storages && volume < Config.minStorageEnergy) {
        return;
    }

    const toReinforce = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == structureToReinforce)
                && (structure.hits < minHits * structure.hitsMax);
        }
    }) as Structure[];

    if (toReinforce.length) {
        toReinforce.sort((a: Structure, b: Structure): number => {
            return (a.hits - b.hits);
        });
        towers.forEach(tower => tower.repair(toReinforce[0]));
    }
}

export function run(room: Room, hostileCreepInfo: HostileCreepInfo): void {
    const towers = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }) as StructureTower[];

    if (towers.length > 0) {
        if (hostileCreepInfo.count > 0) {
            defendRoom(towers, hostileCreepInfo);
        }
        else {
            const needStructureReinforcements = room.memory.threatLevel > Config.threatLevelStructureReinforcementThreshold;
            reinforceStructure(room, towers, STRUCTURE_WALL, needStructureReinforcements ? Config.wallTowerRepairThresholdThreat : Config.wallTowerRepairThresholdPeace);
            reinforceStructure(room, towers, STRUCTURE_RAMPART, needStructureReinforcements ? Config.rampartTowerRepairThresholdThreat : Config.rampartTowerRepairThresholdPeace);
            repairStructure(room, towers);
            healCreeps(room, towers);
        }
    }
}
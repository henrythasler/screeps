import { Trait } from "./trait";
import { log, Loglevel } from "./debug";
import { RoomInfo, Direction, ExitDetail, roomInfoMap, serializeRoomInfo } from "./room.info";
import { Config } from "./config";
import { Task } from "./task";
import { categorizeCreepLocation, Location } from "./location";
import { zoo } from "./zoo";
import { mergeArrays, removeEntries } from "./helper";

function evaluateExitProperties(exitTo: string, direction: Direction, creep: Creep, visuals: boolean): ExitDetail {
    let blocked = true;

    const steps: PathStep[] = creep.pos.findPathTo(new RoomPosition(25, 25, exitTo));
    // log(`${direction}: ${steps.length} (${steps[steps.length - 1]?.x}, ${steps[steps.length - 1]?.y})`, Loglevel.DEBUG);

    if (steps.length) {

        if (visuals) {
            const path: RoomPosition[] = [];
            steps.forEach((step) => {
                path.push(new RoomPosition(step.x, step.y, creep.room.name));
            });
            creep.room.visual.poly(path);
        }

        switch (direction) {
            case Direction.TOP: blocked = steps[steps.length - 1]?.y != 0; break;
            case Direction.RIGHT: blocked = steps[steps.length - 1]?.x != 49; break;
            case Direction.BOTTOM: blocked = steps[steps.length - 1]?.y != 49; break;
            case Direction.LEFT: blocked = steps[steps.length - 1]?.x != 0; break;
        }
    }
    return {
        blocked: blocked,
    };
}

function evaluateRoomInfo(creep: Creep): RoomInfo {
    const exits = new Map<Direction, ExitDetail>();

    const exitsTemp = Game.map.describeExits(creep.room.name);
    if (exitsTemp[1]) exits.set(Direction.TOP, evaluateExitProperties(exitsTemp[1], Direction.TOP, creep, Config.roomReconVisuals));
    if (exitsTemp[3]) exits.set(Direction.RIGHT, evaluateExitProperties(exitsTemp[3], Direction.RIGHT, creep, Config.roomReconVisuals));
    if (exitsTemp[5]) exits.set(Direction.BOTTOM, evaluateExitProperties(exitsTemp[5], Direction.BOTTOM, creep, Config.roomReconVisuals));
    if (exitsTemp[7]) exits.set(Direction.LEFT, evaluateExitProperties(exitsTemp[7], Direction.LEFT, creep, Config.roomReconVisuals));

    const roominfo: RoomInfo = {
        exits: exits,
        lastVisit: Game.time,
        hostile: creep.room.find(FIND_HOSTILE_CREEPS).length > 0,
        reserved: creep.room.controller?.reservation != undefined && creep.room.controller.reservation.username == Config.userName,
        occupied: creep.room.controller?.reservation != undefined && creep.room.controller.reservation.username != Config.userName,
        availableSources: creep.room.find(FIND_SOURCES).length,
    };

    // log(`[${creep.room.name}] ${JSON.stringify(serializeRoomInfo(roominfo))}`, Loglevel.DEBUG);
    return roominfo;
}

export function execute(creep: Creep): boolean {
    const species = zoo.get(creep.memory.role)?.get(creep.memory.speciesName);
    if (species) {
        const location = categorizeCreepLocation(creep.room, creep.memory.homeBase);

        // derive available traits for the current room and general traits
        const traits = removeEntries(mergeArrays(species.traits.get(location), species.traits.get(Location.EVERYWHERE)), species.traits.get(Location.NOWHERE));
      
        if (!traits.includes(Trait.RECON_ROOM)) {
            return false;            
        }

        const roomInfo = roomInfoMap.get(creep.room.name);
        if(roomInfo) {
            const due = roomInfo.lastVisit ? (Game.time - roomInfo.lastVisit) > (roomInfo.hostile ? Config.scoutRoomReconCooldownHostile : Config.scoutRoomReconCooldownNeutral) : true;
            if(!due) {
                return false;
            }
        }   

        if (!([Task.RESERVE_CONTROLLER, Task.CLAIM_CONTROLLER].includes(creep.memory.task))) {
            roomInfoMap.set(creep.room.name, evaluateRoomInfo(creep));
        }
    }
    return false;
}
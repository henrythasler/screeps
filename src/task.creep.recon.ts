import { Trait } from "./trait";
import { log, Loglevel } from "./debug";
import { RoomInfo, Direction, ExitDetail, roomInfoMap, serializeRoomInfo } from "./roominfo";
import { Config } from "./config";

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

    log(`[${creep.room.name}] ${JSON.stringify(serializeRoomInfo({
        exits: exits,
        hostile: creep.room.find(FIND_HOSTILE_CREEPS).length > 0,
        lastVisit: Game.time
    }))}`, Loglevel.DEBUG);
    return {
        exits: exits,
        hostile: creep.room.find(FIND_HOSTILE_CREEPS).length > 0,
        lastVisit: Game.time
    };
}

export function execute(creep: Creep): boolean {
    if (creep.memory.occupation.includes(Trait.RECON_ROOM)) {
        const sources: Source[] = creep.room.find(FIND_SOURCES) as Source[];

        roomInfoMap.set(creep.room.name, evaluateRoomInfo(creep));

        for (const source of sources) {
            if (!Memory.knownSources.includes(source.id)) {
                Memory.knownSources.push(source.id);
                log(`[${creep.room.name}][recon] found new source: ${source}`, Loglevel.INFO);
            }
        }
    }
    return false;
}
import { Task, nonInterruptableTasks, idleTasks } from "./task";
import { EnergyLocation } from "./manager.global";
import { Trait } from "./trait";
import { Loglevel, log } from "./debug";

export function execute(creep: Creep): boolean {

    if (creep.memory.occupation.includes(Trait.SCOUT_ROOMS)) {

        const terrain = Game.map.getRoomTerrain(creep.room.name);
        const exitsTemp = Game.map.describeExits(creep.room.name);

        const exits: string[] = [];
        if (exitsTemp[1]) exits.push(exitsTemp[1]);
        if (exitsTemp[3]) exits.push(exitsTemp[3]);
        if (exitsTemp[5]) exits.push(exitsTemp[5]);
        if (exitsTemp[7]) exits.push(exitsTemp[7]);

        log(`exits: ${exits.length} ${exits.join(", ")}`, Loglevel.INFO);
        exits.forEach((exit, index) => {
            const steps: PathStep[] = creep.pos.findPathTo(new RoomPosition(25, 25, exit));
            const path: RoomPosition[] = [];
            steps.forEach((step) => {
                path.push(new RoomPosition(step.x, step.y, creep.room.name));
            });

            creep.room.visual.poly(path);
            creep.say(`${steps.length}`);
            // return true;
            // log(`${JSON.stringify(path)}`, Loglevel.INFO);
        });

        // const exit = exits[0];
        // const steps: PathStep[] = creep.pos.findPathTo(RoomPosition(25, 25, exit));
        // const path: RoomPosition[] = [];
        // steps.forEach( (step) => {
        //     path.push(new RoomPosition(step.x, step.y, creep.room.name));
        // });

        // creep.room.visual.poly(path, {stroke: '#ff0000'});


        // creep.moveByPath(steps);
        creep.moveTo(new RoomPosition(25, 25, exits[0]));

        return true;

        // const hops = Game.map.getRoomLinearDistance(creep.room.name, target.room.name);



        // if (creep.memory.task != Task.SWITCH_ROOM || creep.memory.targetLocation?.roomName != creep.room.name || !creep.memory.targetLocation) {
        // pick a random direction
        // const type = ([FIND_EXIT_TOP, FIND_EXIT_RIGHT, FIND_EXIT_BOTTOM, FIND_EXIT_LEFT])[(Math.floor(Math.random() * 4))];
        // const exits = creep.room.find(type);

        // creep.memory.targetLocation = exits.find( (exit) => {
        // return creep.room.lookAt(exit)[0].type != "structure";
        // return creep.room.getTerrain().get(exit.x, exit.y) != TERRAIN_MASK_WALL;
        // });
        // log(`exits: ${exits.length}, picked ${creep.memory.targetLocation}`, Loglevel.INFO);
        // }


        // if(creep.memory.targetLocation) {
        //     creep.memory.task = Task.SWITCH_ROOM;
        //     const target = creep.memory.targetLocation as RoomPosition;
        //     const res = creep.moveTo(target.x, target.y, { visualizePathStyle: { stroke: '#0000ff' } });
        //     if (res != OK) {
        //         log(`[${creep.room.name}][${creep.name}] moveto(${creep.memory.targetLocation.x}, ${creep.memory.targetLocation.y}) failed: ${res}`, Loglevel.ERROR);
        //         creep.memory.task = Task.IDLE;
        //         return false;
        //     }            
        //     return true;
        // }
    }
    return false;
}
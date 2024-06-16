import { Task, taskToString } from "./types";

export function run(creep: Creep) {
    if ((creep.memory.currentTask != Task.CHARGE) && (creep.store[RESOURCE_ENERGY] == 0)) {
        // add current task to queue for later execution
        if (creep.memory.currentTask != Task.IDLE) {
            creep.memory.taskQueue.push(creep.memory.currentTask);
        }
        creep.memory.taskQueue.push(Task.CHARGE);
        creep.memory.currentTask = Task.IDLE;
    }

    // pick a new task if nothing to do
    if (creep.memory.currentTask == Task.IDLE) {
        creep.memory.currentTask = creep.memory.taskQueue.pop() ?? Task.IDLE;

        switch (creep.memory.currentTask) {
            case Task.CHARGE: creep.say('🪫'); break;
            case Task.CHARGE_STRUCTURE: creep.say('⚡'); break;
            case Task.UPGRADE_STRUCTURE: creep.say('⬆️'); break;
            case Task.BUILD_STRUCTURE: creep.say('🛠️'); break;
            default: creep.say('💤');
        }
    }

    // console.log(`[${creep.name}] currentTask: ${taskToString(creep.memory.currentTask)}, queue: [${creep.memory.taskQueue.join(', ')}]`)

    // execute current task
    if (creep.memory.currentTask == Task.CHARGE) {
        if (creep.store.getFreeCapacity() > 0) {
            var sources = creep.room.find(FIND_SOURCES);
            if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
        // energy is full, so we can do some work
        else {
            creep.memory.currentTask = Task.IDLE;
        }
    }
    else if (creep.memory.currentTask == Task.CHARGE_STRUCTURE) {
        // structures that need recharging
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });
        if (targets.length > 0) {
            if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
            }
        }
        else {
            creep.memory.currentTask = Task.IDLE;
        }
    }
    else if ((creep.memory.currentTask == Task.UPGRADE_STRUCTURE) && creep.room.controller) {
        if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
        }
    }
    else if (creep.memory.currentTask == Task.BUILD_STRUCTURE) {
        const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (targets.length) {
            if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
            }
        }
    }

    // check for structures that need recharging
    var structuresToCharge = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION ||
                structure.structureType == STRUCTURE_SPAWN ||
                structure.structureType == STRUCTURE_TOWER) &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    });

    if ((structuresToCharge.length > 0) && (creep.memory.currentTask != Task.CHARGE_STRUCTURE) && (creep.memory.taskQueue.indexOf(Task.CHARGE_STRUCTURE) < 0)) {
        creep.memory.taskQueue.push(Task.CHARGE_STRUCTURE);
        return;
    }

    // check for construction sites
    const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);

    if ((constructionSites.length) && (creep.memory.currentTask == Task.IDLE) && (creep.memory.taskQueue.length == 0)) {
        creep.memory.taskQueue.push(Task.BUILD_STRUCTURE);
        return;
    }
}
import { Loglevel, log } from "./debug";
import { Config } from "./config";
import { EnergyLocation, Role, roleToString, Species, findMostExpensiveSpecies, managePopulation, manageTraitDistribution } from "./manager.global";
import { Task } from "./task";
import { Trait } from "./trait";
import { Location } from "./location";
import { zoo } from "./zoo";

/*
const workerZoo: Map<string, Species> = new Map([
    ["WORKER_ENTRY", {
        parts: [WORK, CARRY, CARRY, MOVE, MOVE],
        traits: new Map([
            [Location.EVERYWHERE,[
            Trait.ACTION_HOME,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_CONTAINER,
            Trait.CHARGE_SOURCE,
            Trait.CHARGE_LINK,
            Trait.STORE_ENERGY,
            Trait.STORE_CONTAINER,
            Trait.STORE_STORAGE,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
            Trait.RENEW_CREEP,
        ]]]),
        cost: 300,
    }],
    ["WORKER_ENTRY_HEAVY", {
        parts: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        traits: new Map([
            [Location.EVERYWHERE,[
            Trait.ACTION_HOME,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_CONTAINER,
            Trait.CHARGE_SOURCE,
            Trait.CHARGE_LINK,
            Trait.STORE_ENERGY,
            Trait.STORE_CONTAINER,
            Trait.STORE_STORAGE,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
            Trait.RENEW_CREEP,
        ]]]),
        cost: 400,
    }],
    ["WORKER_BASIC_SLOW", {
        parts: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE],
        traits: new Map([
            [Location.EVERYWHERE,[
            Trait.ACTION_HOME,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_CONTAINER,
            Trait.CHARGE_SOURCE,
            Trait.CHARGE_LINK,
            Trait.STORE_ENERGY,
            Trait.STORE_CONTAINER,
            Trait.STORE_STORAGE,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
            Trait.RENEW_CREEP,
        ]]]),
        cost: 550,
    }],
    ["WORKER_BASIC", {
        parts: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
        traits: new Map([
            [Location.EVERYWHERE,[
            Trait.ACTION_HOME,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_CONTAINER,
            Trait.CHARGE_SOURCE,
            Trait.CHARGE_LINK,
            Trait.STORE_ENERGY,
            Trait.STORE_CONTAINER,
            Trait.STORE_STORAGE,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
            Trait.RENEW_CREEP,
        ]]]),
        cost: 600,
    }],    
    ["WORKER_BASIC_FAST", {
        parts: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        traits: new Map([
            [Location.EVERYWHERE,[
            Trait.ACTION_HOME,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_CONTAINER,
            Trait.CHARGE_SOURCE,
            Trait.CHARGE_LINK,
            Trait.STORE_ENERGY,
            Trait.STORE_CONTAINER,
            Trait.STORE_STORAGE,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
            Trait.RENEW_CREEP,
        ]]]),
        cost: 700,
    }],
    ["WORKER_BASIC_HEAVY", {
        parts: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        traits: new Map([
            [Location.EVERYWHERE,[
            Trait.ACTION_HOME,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_CONTAINER,
            Trait.CHARGE_SOURCE,
            Trait.CHARGE_LINK,
            Trait.STORE_ENERGY,
            Trait.STORE_CONTAINER,
            Trait.STORE_STORAGE,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
            Trait.RENEW_CREEP,
        ]]]),
        cost: 800,
    }],    
    ["WORKER_INTERMEDIATE", {
        parts: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        traits: new Map([
            [Location.EVERYWHERE,[
            Trait.ACTION_HOME,
            Trait.CHARGE_STORAGE,
            Trait.CHARGE_CONTAINER,
            // Trait.CHARGE_SOURCE,
            Trait.CHARGE_LINK,
            Trait.STORE_ENERGY,
            Trait.STORE_CONTAINER,
            Trait.STORE_STORAGE,
            Trait.REPAIR_STRUCTURE,
            Trait.RECHARGE_STRUCTURE,
            Trait.RECHARGE_CONTROLLER,
            Trait.BUILD_STRUCTURE,
            Trait.REFRESH_CONTROLLER,
            Trait.RENEW_CREEP,
        ]]]),
        cost: 1200,
    }],

    // ["WORKER_BASIC_HEAVY", {
    //     parts: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    //     traits: [
    //         Trait.CHARGE_LOCAL,
    //         // Trait.CHARGE_STORAGE,
    //         Trait.CHARGE_SOURCE,
    //         Trait.STORE_ENERGY,
    //         Trait.REPAIR_STRUCTURE,
    //         Trait.RECHARGE_STRUCTURE,
    //         Trait.RECHARGE_CONTROLLER,
    //         Trait.BUILD_STRUCTURE,
    //         Trait.REFRESH_CONTROLLER,
    //     ],
    //     cost: 900,
    // }],     
]);
*/

export function run(room: Room, role: Role): void {
    const creeps: Creep[] = room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
            return creep.memory.role == role;
        }
    });

    const minCount = Config.creeps.get(role)?.minCount.get(room.name) ?? 0;
    room.memory.creepCensus.set(role, { current: creeps.length, required: minCount });

    const speciesZoo = zoo.get(role);
    if(speciesZoo) {
        managePopulation(minCount, creeps.length, room, speciesZoo, role);
        // manageTraitDistribution(creeps, zoo, Config.harvester.traitDistribution);   
    }
}
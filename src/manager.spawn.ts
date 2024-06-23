import { Config } from "./config";
import { EnergyLocation, Role, roleToString, Species, findMostExpensiveSpecies } from "./manager.global";
import { Task } from "./task";
import { Trait } from "./trait";


export function run(): void {
    for (const name in Game.spawns) {
        const spawn = Game.spawns[name];
    }
}
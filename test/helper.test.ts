import { expect } from "chai";
import "jest";
import { actionAllowed } from "../src/helper";
import { Direction } from "../src/roominfo";

describe("tree creation", function () {
    it("simple creation", function () {
        const creep: Creep = new Creep("3" as Id<Creep>);
        creep.memory.homeBase = "E37S37";
        expect(actionAllowed(creep)).equal("E37S36");
    });
});

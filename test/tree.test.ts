import { expect } from "chai";
import "jest";
import { getRoomNameByDirection } from "../src/helper";
import { Direction } from "../src/roominfo";

describe("tree creation", function () {
    it("simple creation", function () {
        expect(getRoomNameByDirection("E37S37", Direction.TOP)).equal("E37S36");
        expect(getRoomNameByDirection("E37S37", Direction.RIGHT)).equal("E38S37");
        expect(getRoomNameByDirection("E37S37", Direction.BOTTOM)).equal("E37S38");
        expect(getRoomNameByDirection("E37S37", Direction.LEFT)).equal("E36S37");
    });
});

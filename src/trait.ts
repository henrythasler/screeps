export enum Trait {
    CHARGE_LOCAL,
    CHARGE_AWAY,

    CHARGE_STORAGE,
    CHARGE_SOURCE,

    STORE_ENERGY,

    REPAIR_STRUCTURE,

    RECHARGE_STRUCTURE,     // transfer energy to a structure (Spawn, Tower, ...)
    RECHARGE_CONTROLLER,    // transfer energy to a controller

    BUILD_STRUCTURE,

    REFRESH_CONTROLLER,     // transfer energy to a controller to avoid decay

    CLAIM_CONTROLLER,

    RESERVE_CONTROLLER,

    SWITCH_ROOM,    // allow movement to another room
    RECON,  // can add objects to global memory
}

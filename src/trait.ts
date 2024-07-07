export enum Trait {
    ACTION_HOME,
    ACTION_OUTPOST,
    ACTION_AWAY,

    CHARGE_STORAGE,
    CHARGE_CONTAINER,
    CHARGE_SOURCE,
    CHARGE_LINK,    

    STORE_ENERGY,
    STORE_CONTAINER,
    STORE_STORAGE,
    STORE_LINK,    

    REPAIR_STRUCTURE,

    RECHARGE_STRUCTURE,     // transfer energy to a structure (Spawn, Tower, ...)
    RECHARGE_CONTROLLER,    // transfer energy to a controller

    BUILD_STRUCTURE,

    REFRESH_CONTROLLER,     // transfer energy to a controller to avoid decay

    CLAIM_CONTROLLER,

    RESERVE_CONTROLLER,

    SWITCH_ROOM,    // allow movement to another room
    RECON_ROOM,  // can add objects to global memory
    SCOUT_ROOMS,    // traverse known rooms

    SPAWN_CREEP,
    RENEW_CREEP,
    RECYCLE_CREEP,

    HARVEST_SOURCE,
    ATTACK_HOSTILE,
    // LOCATE_SOURCE,
}

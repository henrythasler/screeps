export interface ExitDetail {
    available: boolean; // general availability
    blocked: boolean;   // blocked by a wall or rampart
    explored: boolean;  // has been used before
}

export class RoomDetails {
    name: string;
    exitTop: ExitDetail | null = null;

    constructor(name: string) {
        this.name = name;
    }
}

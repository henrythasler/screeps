export enum Loglevel {
    SILENT,
    ERROR,
    WARNING,
    INFO,
    DEBUG,
}

export function log(message: string, level: Loglevel): void {
    if(level >= Loglevel.DEBUG) {
        console.log(message);
    }
}
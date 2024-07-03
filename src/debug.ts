export enum Loglevel {
    SILENT,
    ERROR,
    WARNING,
    INFO,
    DEBUG,
}

export function log(message: string, level: Loglevel = Loglevel.INFO): void {
    if(level <= Loglevel.INFO) {
        console.log(message);
    }
}
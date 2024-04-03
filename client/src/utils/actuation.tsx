export type ConfigurationType = {
    timestamp: string;
    angle: number;
    arrayDimension: number;
    bitness: number;
    configuration: object;
    columns: object;
    frequency: number;
    multiArrayDimension: number;
}

export type AntennaPatternType = {
    pF: Array<number>;
}

export type AntennaPatternStatsType = {
    maxPF: number;
    indexMaxPF: number;
    minPF: number;
    indexMinPF: number;
}

export const defaultActuatedCells = {
    "0": false,
    "1": false,
    "2": false,
    "3": false,
    "4": false,
    "5": false,
    "6": false,
    "7": false,
    "8": false,
    "9": false,
    "10": false,
    "11": false,
    "12": false,
    "13": false,
    "14": false,
    "15": false,
};
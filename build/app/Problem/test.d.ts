export interface TestInterface {
    id: number;
    inputFile: string;
    outputFile?: string;
    timeLimit: number;
    memoryLimit: number;
    score: number;
    group: number;
}
export declare class Test implements TestInterface {
    id: number;
    inputFile: string;
    outputFile: string;
    timeLimit: number;
    memoryLimit: number;
    score: number;
    group: number;
    constructor(id: number, inputFile: string, outputFile: string, timeLimit: number, memoryLimit: number, score: number, group?: number);
}

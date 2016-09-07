export declare class Commands {
    compile: string;
    run: string;
    constructor(compile: string, run: string);
}
export interface LanguageInterface {
    extName: string;
    hdrName: string;
    program: Commands;
    library: Commands;
}

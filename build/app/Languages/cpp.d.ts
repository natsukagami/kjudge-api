import { Commands, LanguageInterface } from './interface';
export declare class CPP implements LanguageInterface {
    extName: string;
    hdrName: string;
    program: Commands;
    library: Commands;
    constructor();
}

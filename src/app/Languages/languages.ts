import { LanguageInterface } from './interface'
import { CPP } from './cpp' 

export { LanguageInterface } from './interface';

export type Language = 'C++';

export function getLanguage(lang: Language): LanguageInterface {
	switch (lang) {
		case 'C++': return new CPP();	
	}
}
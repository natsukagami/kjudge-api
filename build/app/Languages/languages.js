"use strict";
const cpp_1 = require('./cpp');
function getLanguage(lang) {
    switch (lang) {
        case 'C++': return new cpp_1.CPP();
    }
}
exports.getLanguage = getLanguage;
//# sourceMappingURL=languages.js.map
// COMPLETE CORRECTED js/modules/moduleDefinitions.js FILE
// Replace your entire moduleDefinitions.js with this:

import { CipherModule } from './CipherModule.js';

// Enigma cipher helper function (must be defined BEFORE the array)
function enigmaCipher(text, config) {
    const ROTORS = {
        'I':    'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
        'II':   'AJDKSIRUXBLHWTMCQGZNPYFVOE',
        'III':  'BDFHJLCPRTXVZNYEIWGAKMUSQO',
        'IV':   'ESOVPZJAYQUIRHXLNFTGKDCMWB',
        'V':    'VZBRGITYUPSDNHLXAWMJQOFECK',
        'VI':   'JPGVOUMFYQBENHZRDKASXLICTW',
        'VII':  'NZJHGRCXMYSWBOUFAIVLPEKQDT',
        'VIII': 'FKQHTLXOCBJSPDZRAMEWNIUYGV'
    };

    const NOTCHES = {
        'I': 'Q', 'II': 'E', 'III': 'V', 'IV': 'J', 'V': 'Z',
        'VI': 'ZM', 'VII': 'ZM', 'VIII': 'ZM'
    };

    const REFLECTORS = {
        'UKW A': 'EJMZALYXVBWFCRQUONTSPIKHGD',
        'UKW B': 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
        'UKW C': 'FVPJIAOYEDRZXWGCTKUQSBNMHL'
    };

    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    function parsePlugboard(plugboardStr) {
        const pairs = plugboardStr.toUpperCase().trim().split(/\s+/);
        const mapping = {};
        
        for (let i = 0; i < 26; i++) {
            mapping[ALPHABET[i]] = ALPHABET[i];
        }
        
        pairs.forEach(pair => {
            if (pair.length === 2) {
                const [a, b] = pair.split('');
                if (ALPHABET.includes(a) && ALPHABET.includes(b)) {
                    mapping[a] = b;
                    mapping[b] = a;
                }
            }
        });
        
        return mapping;
    }

    function throughPlugboard(letter, plugboard) {
        return plugboard[letter] || letter;
    }

    function throughRotor(letter, rotor, position, ringSetting) {
        const shift = (position - ringSetting + 26) % 26;
        const index = (ALPHABET.indexOf(letter) + shift) % 26;
        const output = rotor[index];
        const outputIndex = (ALPHABET.indexOf(output) - shift + 26) % 26;
        return ALPHABET[outputIndex];
    }

    function throughRotorReverse(letter, rotor, position, ringSetting) {
        const shift = (position - ringSetting + 26) % 26;
        const shiftedLetter = ALPHABET[(ALPHABET.indexOf(letter) + shift) % 26];
        const index = rotor.indexOf(shiftedLetter);
        const outputIndex = (index - shift + 26) % 26;
        return ALPHABET[outputIndex];
    }

    function throughReflector(letter, reflector) {
        return reflector[ALPHABET.indexOf(letter)];
    }

    function atNotch(rotor, position) {
        const rotorName = Object.keys(ROTORS).find(key => ROTORS[key] === rotor);
        const notch = NOTCHES[rotorName];
        const letter = ALPHABET[(position - 1) % 26];
        return notch.includes(letter);
    }

    const rotor1 = ROTORS[config.rotor1 || 'I'];
    const rotor2 = ROTORS[config.rotor2 || 'II'];
    const rotor3 = ROTORS[config.rotor3 || 'III'];
    const reflector = REFLECTORS[config.reflector || 'UKW B'];
    const plugboard = parsePlugboard(config.plugboard || '');

    let pos1 = parseInt(config.rotor1pos) || 1;
    let pos2 = parseInt(config.rotor2pos) || 1;
    let pos3 = parseInt(config.rotor3pos) || 1;

    const ring1 = parseInt(config.rotor1ring) || 1;
    const ring2 = parseInt(config.rotor2ring) || 1;
    const ring3 = parseInt(config.rotor3ring) || 1;

    let result = '';

    for (let char of text.toUpperCase()) {
        if (!ALPHABET.includes(char)) {
            result += char;
            continue;
        }

        if (atNotch(rotor2, pos2)) {
            pos2 = (pos2 % 26) + 1;
            pos3 = (pos3 % 26) + 1;
        } else if (atNotch(rotor1, pos1)) {
            pos2 = (pos2 % 26) + 1;
        }
        pos1 = (pos1 % 26) + 1;

        let letter = char;
        
        letter = throughPlugboard(letter, plugboard);
        letter = throughRotor(letter, rotor1, pos1, ring1);
        letter = throughRotor(letter, rotor2, pos2, ring2);
        letter = throughRotor(letter, rotor3, pos3, ring3);
        letter = throughReflector(letter, reflector);
        letter = throughRotorReverse(letter, rotor3, pos3, ring3);
        letter = throughRotorReverse(letter, rotor2, pos2, ring2);
        letter = throughRotorReverse(letter, rotor1, pos1, ring1);
        letter = throughPlugboard(letter, plugboard);
        
        result += letter;
    }

    return result;
}

// All module definitions
export const moduleDefinitions = [
    new CipherModule({
        id: 'base64',
        name: 'Base64',
        category: 'Encoding',
        description: 'Standard Base64 encoding',
        encode: (input) => btoa(unescape(encodeURIComponent(input))),
        decode: (input) => decodeURIComponent(escape(atob(input)))
    }),

    new CipherModule({
        id: 'caesar',
        name: 'Caesar Cipher',
        category: 'Classical',
        description: 'Shift each letter by N positions',
        parameters: [
            { name: 'shift', label: 'Shift', type: 'number', default: 3, min: 1, max: 25 }
        ],
        encode: (input, params) => {
            const shift = parseInt(params.shift || 3);
            return input.replace(/[a-zA-Z]/g, char => {
                const base = char <= 'Z' ? 65 : 97;
                return String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
            });
        },
        decode: (input, params) => {
            const shift = parseInt(params.shift || 3);
            return input.replace(/[a-zA-Z]/g, char => {
                const base = char <= 'Z' ? 65 : 97;
                return String.fromCharCode(((char.charCodeAt(0) - base - shift + 26) % 26) + base);
            });
        }
    }),

    new CipherModule({
        id: 'hex',
        name: 'Hexadecimal',
        category: 'Encoding',
        description: 'Convert to/from hexadecimal',
        encode: (input) => {
            return Array.from(input).map(c => 
                c.charCodeAt(0).toString(16).padStart(2, '0')
            ).join('');
        },
        decode: (input) => {
            const hex = input.replace(/\s/g, '');
            let str = '';
            for (let i = 0; i < hex.length; i += 2) {
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            }
            return str;
        }
    }),

    new CipherModule({
        id: 'binary',
        name: 'Binary',
        category: 'Encoding',
        description: 'Convert to/from binary',
        encode: (input) => {
            return Array.from(input).map(c => 
                c.charCodeAt(0).toString(2).padStart(8, '0')
            ).join(' ');
        },
        decode: (input) => {
            return input.split(/\s+/).map(bin => 
                String.fromCharCode(parseInt(bin, 2))
            ).join('');
        }
    }),

    new CipherModule({
        id: 'reverse',
        name: 'Reverse',
        category: 'Transform',
        description: 'Reverse the text',
        encode: (input) => input.split('').reverse().join(''),
        decode: (input) => input.split('').reverse().join('')
    }),

    new CipherModule({
        id: 'rot13',
        name: 'ROT13',
        category: 'Classical',
        description: 'Rotate by 13 positions',
        encode: (input) => {
            return input.replace(/[a-zA-Z]/g, char => {
                const base = char <= 'Z' ? 65 : 97;
                return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
            });
        },
        decode: (input) => {
            return input.replace(/[a-zA-Z]/g, char => {
                const base = char <= 'Z' ? 65 : 97;
                return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
            });
        }
    }),

    new CipherModule({
        id: 'atbash',
        name: 'Atbash',
        category: 'Classical',
        description: 'Reverse alphabet substitution',
        encode: (input) => {
            return input.replace(/[a-zA-Z]/g, char => {
                const base = char <= 'Z' ? 65 : 97;
                return String.fromCharCode(base + (25 - (char.charCodeAt(0) - base)));
            });
        },
        decode: (input) => {
            return input.replace(/[a-zA-Z]/g, char => {
                const base = char <= 'Z' ? 65 : 97;
                return String.fromCharCode(base + (25 - (char.charCodeAt(0) - base)));
            });
        }
    }),

    new CipherModule({
        id: 'morse',
        name: 'Morse Code',
        category: 'Encoding',
        description: 'Convert to/from Morse code',
        encode: (input) => {
            const morseMap = {
                'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
                'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
                'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
                'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
                'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
                '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
                '8': '---..', '9': '----.', ' ': '/'
            };
            return input.toUpperCase().split('').map(c => morseMap[c] || c).join(' ');
        },
        decode: (input) => {
            const morseMap = {
                '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F',
                '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
                '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
                '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
                '-.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2',
                '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7',
                '---..': '8', '----.': '9', '/': ' '
            };
            return input.split(' ').map(c => morseMap[c] || c).join('');
        }
    }),

    new CipherModule({
        id: 'url',
        name: 'URL Encode',
        category: 'Encoding',
        description: 'URL/percent encoding',
        encode: (input) => encodeURIComponent(input),
        decode: (input) => decodeURIComponent(input)
    }),

    new CipherModule({
        id: 'base32',
        name: 'Base32',
        category: 'Encoding',
        description: 'Base32 encoding',
        encode: (input) => {
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
            let bits = '';
            for (let i = 0; i < input.length; i++) {
                bits += input.charCodeAt(i).toString(2).padStart(8, '0');
            }
            let result = '';
            for (let i = 0; i < bits.length; i += 5) {
                const chunk = bits.substr(i, 5).padEnd(5, '0');
                result += alphabet[parseInt(chunk, 2)];
            }
            return result;
        },
        decode: (input) => {
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
            let bits = '';
            for (let i = 0; i < input.length; i++) {
                const index = alphabet.indexOf(input[i].toUpperCase());
                if (index !== -1) {
                    bits += index.toString(2).padStart(5, '0');
                }
            }
            let result = '';
            for (let i = 0; i < bits.length; i += 8) {
                const byte = bits.substr(i, 8);
                if (byte.length === 8) {
                    result += String.fromCharCode(parseInt(byte, 2));
                }
            }
            return result;
        }
    }),

    new CipherModule({
        id: 'enigma',
        name: 'Enigma Machine',
        category: 'Historical',
        description: 'WWII Enigma cipher with configurable rotors',
        parameters: [
            { 
                name: 'model', 
                label: 'Model', 
                type: 'select',
                options: ['Enigma M3', 'Enigma M4', 'Enigma I'],
                default: 'Enigma M3'
            },
            { 
                name: 'reflector', 
                label: 'Reflector', 
                type: 'select',
                options: ['UKW A', 'UKW B', 'UKW C'],
                default: 'UKW B'
            },
            { 
                name: 'rotor1', 
                label: 'Rotor 1', 
                type: 'select',
                options: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'],
                default: 'I'
            },
            { 
                name: 'rotor1pos', 
                label: 'Rotor 1 Position', 
                type: 'number',
                min: 1,
                max: 26,
                default: 1
            },
            { 
                name: 'rotor1ring', 
                label: 'Rotor 1 Ring', 
                type: 'number',
                min: 1,
                max: 26,
                default: 1
            },
            { 
                name: 'rotor2', 
                label: 'Rotor 2', 
                type: 'select',
                options: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'],
                default: 'II'
            },
            { 
                name: 'rotor2pos', 
                label: 'Rotor 2 Position', 
                type: 'number',
                min: 1,
                max: 26,
                default: 1
            },
            { 
                name: 'rotor2ring', 
                label: 'Rotor 2 Ring', 
                type: 'number',
                min: 1,
                max: 26,
                default: 1
            },
            { 
                name: 'rotor3', 
                label: 'Rotor 3', 
                type: 'select',
                options: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'],
                default: 'III'
            },
            { 
                name: 'rotor3pos', 
                label: 'Rotor 3 Position', 
                type: 'number',
                min: 1,
                max: 26,
                default: 1
            },
            { 
                name: 'rotor3ring', 
                label: 'Rotor 3 Ring', 
                type: 'number',
                min: 1,
                max: 26,
                default: 1
            },
            { 
                name: 'plugboard', 
                label: 'Plugboard', 
                type: 'text',
                default: 'bq cr di ej kw mt os px uz gh'
            }
        ],
        encode: (input, params) => {
            return enigmaCipher(input, params);
        },
        decode: (input, params) => {
            return enigmaCipher(input, params);
        }
    })
];
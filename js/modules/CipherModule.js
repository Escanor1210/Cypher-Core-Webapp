// Standard Module Interface
export class CipherModule {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.category = config.category;
        this.description = config.description;
        this.parameters = config.parameters || [];
        this.encode = config.encode;
        this.decode = config.decode;
    }

    execute(input, params, mode = 'encode') {
        try {
            return mode === 'encode' 
                ? this.encode(input, params) 
                : this.decode(input, params);
        } catch (error) {
            throw new Error(`${this.name} error: ${error.message}`);
        }
    }
}
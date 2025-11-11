// Module Registry
export class ModuleRegistry {
    constructor() {
        this.modules = new Map();
    }

    register(module) {
        this.modules.set(module.id, module);
    }

    get(id) {
        return this.modules.get(id);
    }

    getAll() {
        return Array.from(this.modules.values());
    }

    getAllByCategory() {
        const categories = {};
        this.getAll().forEach(module => {
            if (!categories[module.category]) {
                categories[module.category] = [];
            }
            categories[module.category].push(module);
        });
        return categories;
    }
}
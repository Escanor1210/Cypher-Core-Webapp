import { ModuleRegistry } from './modules/ModuleRegistry.js';
import { moduleDefinitions } from './modules/moduleDefinitions.js';
import { UIController } from './ui/UIController.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Create registry and register all modules
    const registry = new ModuleRegistry();
    moduleDefinitions.forEach(module => registry.register(module));

    // Initialize UI Controller
    const ui = new UIController(registry);

    console.log('Cypher Core initialized with', registry.getAll().length, 'modules');
});
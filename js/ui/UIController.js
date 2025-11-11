export class UIController {
    constructor(registry) {
        this.registry = registry;
        this.mode = 'encode';
        this.pipeline = [];
        
        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        this.inputText = document.getElementById('inputText');
        this.outputText = document.getElementById('outputText');
        this.encodeTab = document.getElementById('encodeTab');
        this.decodeTab = document.getElementById('decodeTab');
        this.addModuleBtn = document.getElementById('addModuleBtn');
        this.clearPipelineBtn = document.getElementById('clearPipeline');
        this.moduleSelector = document.getElementById('moduleSelector');
        this.moduleSelectorContent = document.getElementById('moduleSelectorContent');
        this.pipelineDisplay = document.getElementById('pipelineDisplay');
        this.errorDisplay = document.getElementById('errorDisplay');
    }

    initEventListeners() {
        this.inputText.addEventListener('input', () => this.executePipeline());
        this.encodeTab.addEventListener('click', () => this.setMode('encode'));
        this.decodeTab.addEventListener('click', () => this.setMode('decode'));
        this.addModuleBtn.addEventListener('click', () => this.toggleModuleSelector());
        this.clearPipelineBtn.addEventListener('click', () => this.clearPipeline());
        
        this.renderModuleSelector();
    }

    setMode(mode) {
        this.mode = mode;
        this.encodeTab.classList.toggle('active', mode === 'encode');
        this.decodeTab.classList.toggle('active', mode === 'decode');
        this.executePipeline();
    }

    toggleModuleSelector() {
        this.moduleSelector.classList.toggle('hidden');
    }

    renderModuleSelector() {
        const categories = this.registry.getAllByCategory();
        let html = '';
        
        for (const [category, modules] of Object.entries(categories)) {
            html += `
                <div class="module-category">
                    <div class="category-title">${category}</div>
                    ${modules.map(module => `
                        <button class="module-button" data-module-id="${module.id}">
                            <span class="module-name">${module.name}</span>
                            <span class="module-description">${module.description}</span>
                        </button>
                    `).join('')}
                </div>
            `;
        }
        
        this.moduleSelectorContent.innerHTML = html;
        
        // Add click listeners to module buttons
        this.moduleSelectorContent.querySelectorAll('.module-button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addModule(btn.dataset.moduleId);
            });
        });
    }

    addModule(moduleId) {
        const module = this.registry.get(moduleId);
        const params = {};
        
        module.parameters.forEach(p => {
            params[p.name] = p.default;
        });
        
        this.pipeline.push({
            id: Date.now(),
            moduleId: moduleId,
            params: params
        });
        
        this.moduleSelector.classList.add('hidden');
        this.renderPipeline();
        this.executePipeline();
    }

    removeModule(stepId) {
        this.pipeline = this.pipeline.filter(step => step.id !== stepId);
        this.renderPipeline();
        this.executePipeline();
    }

    updateParam(stepId, paramName, value) {
        const step = this.pipeline.find(s => s.id === stepId);
        if (step) {
            step.params[paramName] = value;
            this.executePipeline();
        }
    }

    clearPipeline() {
        this.pipeline = [];
        this.renderPipeline();
        this.executePipeline();
    }

renderPipeline() {
    if (this.pipeline.length === 0) {
        this.pipelineDisplay.innerHTML = '<div class="empty-state">No modules in pipeline. Click "Add Module" to start.</div>';
        this.clearPipelineBtn.classList.remove('visible');
        return;
    }

    this.clearPipelineBtn.classList.add('visible');

    let html = '';
    this.pipeline.forEach((step, index) => {
        const module = this.registry.get(step.moduleId);
        html += `
            <div class="pipeline-step" data-step-id="${step.id}">
                <div class="step-header">
                    <div class="step-title">
                        <span class="step-number">${index + 1}.</span>
                        <span class="step-name">${module.name}</span>
                    </div>
                    <button class="btn-remove" data-step-id="${step.id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                ${module.parameters.length > 0 ? `
                    <div class="step-params">
                        ${module.parameters.map(param => {
                            if (param.type === 'select') {
                                return `
                                    <div class="param-group">
                                        <label class="param-label">${param.label}</label>
                                        <select 
                                            class="param-input"
                                            data-step-id="${step.id}"
                                            data-param-name="${param.name}"
                                        >
                                            ${param.options.map(opt => `
                                                <option value="${opt}" ${step.params[param.name] === opt ? 'selected' : ''}>
                                                    ${opt}
                                                </option>
                                            `).join('')}
                                        </select>
                                    </div>
                                `;
                            } else {
                                return `
                                    <div class="param-group">
                                        <label class="param-label">${param.label}</label>
                                        <input 
                                            type="${param.type}" 
                                            class="param-input"
                                            value="${step.params[param.name]}"
                                            min="${param.min || ''}"
                                            max="${param.max || ''}"
                                            data-step-id="${step.id}"
                                            data-param-name="${param.name}"
                                        />
                                    </div>
                                `;
                            }
                        }).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    });

    this.pipelineDisplay.innerHTML = html;

    // Add event listeners
    this.pipelineDisplay.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            this.removeModule(parseInt(btn.dataset.stepId));
        });
    });

    this.pipelineDisplay.querySelectorAll('.param-input').forEach(input => {
        input.addEventListener('input', (e) => {
            this.updateParam(
                parseInt(e.target.dataset.stepId),
                e.target.dataset.paramName,
                e.target.value
            );
        });
        // Also handle 'change' event for select elements
        input.addEventListener('change', (e) => {
            this.updateParam(
                parseInt(e.target.dataset.stepId),
                e.target.dataset.paramName,
                e.target.value
            );
        });
    });
}
    executePipeline() {
        if (this.pipeline.length === 0) {
            this.outputText.innerHTML = '<span class="placeholder">Output will appear here...</span>';
            this.hideError();
            return;
        }

        try {
            let result = this.inputText.value;
            const steps = this.mode === 'encode' ? this.pipeline : [...this.pipeline].reverse();

            for (const step of steps) {
                const module = this.registry.get(step.moduleId);
                if (module) {
                    result = module.execute(result, step.params, this.mode);
                }
            }

            this.outputText.textContent = result;
            this.hideError();
        } catch (error) {
            this.showError(error.message);
            this.outputText.innerHTML = '<span class="placeholder">Error occurred during transformation</span>';
        }
    }

    showError(message) {
        this.errorDisplay.textContent = message;
        this.errorDisplay.classList.remove('hidden');
    }

    hideError() {
        this.errorDisplay.classList.add('hidden');
    }
}
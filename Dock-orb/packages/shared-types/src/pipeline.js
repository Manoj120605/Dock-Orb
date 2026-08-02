"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PIPELINE_CONFIG = void 0;
exports.DEFAULT_PIPELINE_CONFIG = {
    maxTokenBudget: 4096,
    cacheThreshold: 0.92,
    summarizationInterval: 5,
    embeddingTopK: 5,
    minRelevanceScore: 0.7,
    enabledNodes: {
        intent_detection: true,
        skill_injection: true,
        capsule_retrieval: true,
        embedding_search: true,
        context_optimization: true,
        model_routing: true,
        cache_check: true,
        provider_call: true,
        response_validation: true,
        capsule_update: true,
        cache_update: true,
    },
    routingPreference: 'balanced',
};
//# sourceMappingURL=pipeline.js.map
/**
 * ARES — API Service Layer
 * ========================
 * Centralized API client for communicating with the ARES FastAPI backend.
 */

const API_BASE = '/api';

async function request(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    };

    const response = await fetch(url, config);
    if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || `HTTP ${response.status}`);
    }
    return response.json();
}

export async function generateCampus(numNodes = 750, seed = 42) {
    return request('/generate-campus', {
        method: 'POST',
        body: JSON.stringify({ num_nodes: numNodes, seed }),
    });
}

export async function runSimulation(config = {}) {
    return request('/run-simulation', {
        method: 'POST',
        body: JSON.stringify({
            num_iterations: config.numIterations || 100,
            max_steps: config.maxSteps || 20,
            initial_compromised: config.initialCompromised || 3,
            infection_probability: config.infectionProbability || 0.5,
            parallel: config.parallel || false,
        }),
    });
}

export async function getRiskMetrics() {
    return request('/risk-metrics');
}

export async function getClusterAnalysis() {
    return request('/cluster-analysis');
}

export async function getAttackPaths() {
    return request('/attack-path');
}

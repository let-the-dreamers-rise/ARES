import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopStatusBar from './components/TopStatusBar';
import LeftControlPanel from './components/LeftControlPanel';
import StrategicMap from './components/StrategicMap';
import RightIntelPanel from './components/RightIntelPanel';
import BottomCommandPanel from './components/BottomCommandPanel';
import { generateCampus, runSimulation, getRiskMetrics, getClusterAnalysis, getAttackPaths } from './services/api';

/**
 * ARES — Main Application Shell
 * ==============================
 * Tactical Cyber Command Center layout:
 *
 *  ┌─────────────────────────────────────┐
 *  │          TOP STATUS BAR             │
 *  ├────────┬────────────────┬───────────┤
 *  │ LEFT   │   CENTER       │  RIGHT    │
 *  │ CTRL   │   STRATEGIC    │  INTEL    │
 *  │ PANEL  │   MAP          │  PANEL    │
 *  ├────────┴────────────────┴───────────┤
 *  │        BOTTOM COMMAND PANEL         │
 *  └─────────────────────────────────────┘
 */
export default function App() {
    // ── State ──────────────────────────────────────
    const [graphData, setGraphData] = useState(null);
    const [simulationResult, setSimulationResult] = useState(null);
    const [riskMetrics, setRiskMetrics] = useState(null);
    const [clusterData, setClusterData] = useState(null);
    const [attackPaths, setAttackPaths] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [maxSteps, setMaxSteps] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [systemStatus, setSystemStatus] = useState('STANDBY');
    const [error, setError] = useState(null);

    // ── Simulation Config ──────────────────────────
    const [config, setConfig] = useState({
        scenario: 'multi-stage',
        numNodes: 750,
        numIterations: 100,
        maxSimSteps: 20,
        initialCompromised: 3,
        infectionProbability: 0.5,
    });

    // ── Handlers ───────────────────────────────────
    const handleGenerateCampus = useCallback(async () => {
        setIsLoading(true);
        setLoadingMessage('Generating synthetic campus network...');
        setError(null);
        setSystemStatus('INITIALIZING');
        try {
            const res = await generateCampus(config.numNodes, Date.now() % 100000);
            setGraphData(res.graph);
            setSimulationResult(null);
            setRiskMetrics(null);
            setClusterData(null);
            setAttackPaths(null);
            setCurrentStep(0);
            setSystemStatus('OPERATIONAL');
        } catch (err) {
            setError(err.message);
            setSystemStatus('ERROR');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [config.numNodes]);

    const handleRunSimulation = useCallback(async () => {
        if (!graphData) {
            setError('Generate campus first');
            return;
        }
        setIsLoading(true);
        setLoadingMessage('Executing Monte Carlo adversarial simulation...');
        setError(null);
        setSystemStatus('SIMULATING');
        try {
            const simRes = await runSimulation({
                numIterations: config.numIterations,
                maxSteps: config.maxSimSteps,
                initialCompromised: config.initialCompromised,
                infectionProbability: config.infectionProbability,
            });
            setSimulationResult(simRes.result);
            if (simRes.result.step_snapshots) {
                setMaxSteps(simRes.result.step_snapshots.length - 1);
                setCurrentStep(0);
            }

            // Fetch risk metrics and cluster data
            setLoadingMessage('Computing risk analytics...');
            const [riskRes, clusterRes, pathRes] = await Promise.all([
                getRiskMetrics(),
                getClusterAnalysis(),
                getAttackPaths(),
            ]);
            setRiskMetrics(riskRes.report);
            setClusterData(clusterRes.clusters);
            setAttackPaths(pathRes);
            setSystemStatus('THREAT_ACTIVE');
        } catch (err) {
            setError(err.message);
            setSystemStatus('ERROR');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [graphData, config]);

    const handleReset = useCallback(() => {
        setGraphData(null);
        setSimulationResult(null);
        setRiskMetrics(null);
        setClusterData(null);
        setAttackPaths(null);
        setCurrentStep(0);
        setMaxSteps(0);
        setSystemStatus('STANDBY');
        setError(null);
    }, []);

    const handleConfigChange = useCallback((key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    }, []);

    // Auto-dismiss error toast after 5 seconds
    useEffect(() => {
        if (!error) return;
        const timer = setTimeout(() => setError(null), 5000);
        return () => clearTimeout(timer);
    }, [error]);

    // ── Computed values ────────────────────────────
    const globalRisk = simulationResult?.global_risk_index ?? 0;
    const threatLevel =
        globalRisk > 70 ? 'CRITICAL' :
            globalRisk > 45 ? 'HIGH' :
                globalRisk > 25 ? 'ELEVATED' :
                    globalRisk > 10 ? 'GUARDED' : 'LOW';

    return (
        <div className="tactical-grid" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
            {/* ── Top Status Bar ──────────────────────── */}
            <TopStatusBar
                systemStatus={systemStatus}
                globalRisk={globalRisk}
                threatLevel={threatLevel}
                isLoading={isLoading}
                loadingMessage={loadingMessage}
            />

            {/* ── Main Content Area ───────────────────── */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left Control Panel */}
                <LeftControlPanel
                    config={config}
                    onConfigChange={handleConfigChange}
                    onGenerate={handleGenerateCampus}
                    onRun={handleRunSimulation}
                    onReset={handleReset}
                    isLoading={isLoading}
                    hasGraph={!!graphData}
                    hasSimulation={!!simulationResult}
                />

                {/* Center Strategic Map */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <StrategicMap
                        graphData={graphData}
                        simulationResult={simulationResult}
                        currentStep={currentStep}
                        maxSteps={maxSteps}
                        onStepChange={setCurrentStep}
                    />
                </div>

                {/* Right Intelligence Panel */}
                <RightIntelPanel
                    riskMetrics={riskMetrics}
                    clusterData={clusterData}
                    attackPaths={attackPaths}
                    simulationResult={simulationResult}
                />
            </div>

            {/* ── Bottom Command Panel ────────────────── */}
            <BottomCommandPanel
                riskMetrics={riskMetrics}
                simulationResult={simulationResult}
                globalRisk={globalRisk}
            />

            {/* ── Error Toast ─────────────────────────── */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        style={{
                            position: 'fixed',
                            bottom: 20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 1000,
                            padding: '10px 24px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            borderRadius: 8,
                            color: '#EF4444',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            backdropFilter: 'blur(10px)',
                            cursor: 'pointer',
                        }}
                        onClick={() => setError(null)}
                    >
                        ⚠ {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

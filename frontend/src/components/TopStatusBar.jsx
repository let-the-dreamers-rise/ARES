import React from 'react';
import { motion } from 'framer-motion';

/**
 * TopStatusBar — Global system status header
 * ============================================
 * Displays: ARES logo, system status, animated risk gauge, threat level
 */
export default function TopStatusBar({ systemStatus, globalRisk, threatLevel, isLoading, loadingMessage }) {
    const statusColor =
        systemStatus === 'OPERATIONAL' ? '#10B981' :
            systemStatus === 'SIMULATING' ? '#3B82F6' :
                systemStatus === 'THREAT_ACTIVE' ? '#EF4444' :
                    systemStatus === 'ERROR' ? '#EF4444' : '#64748B';

    const statusClass =
        systemStatus === 'OPERATIONAL' ? 'status-operational' :
            systemStatus === 'THREAT_ACTIVE' ? 'status-critical' :
                systemStatus === 'SIMULATING' ? 'status-warning' : 'status-operational';

    const threatColor =
        threatLevel === 'CRITICAL' ? '#EF4444' :
            threatLevel === 'HIGH' ? '#F97316' :
                threatLevel === 'ELEVATED' ? '#F59E0B' :
                    threatLevel === 'GUARDED' ? '#3B82F6' : '#10B981';

    // Risk gauge rotation: 0 risk = -90deg, 100 risk = 90deg
    const gaugeRotation = -90 + (globalRisk / 100) * 180;
    const gaugeColor =
        globalRisk > 70 ? '#EF4444' :
            globalRisk > 45 ? '#F59E0B' :
                globalRisk > 25 ? '#3B82F6' : '#10B981';

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                height: 64,
                background: 'linear-gradient(180deg, #0F1419 0%, #0B0F14 100%)',
                borderBottom: '1px solid #1E3A5F',
                flexShrink: 0,
                zIndex: 100,
            }}
        >
            {/* Left: Logo + System Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* ARES Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: 6,
                            background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            color: '#fff',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                            <path d="M16 2L4 8v8c0 7.18 5.12 13.88 12 15.5C22.88 29.88 28 23.18 28 16V8L16 2z" fill="white" opacity="0.9" />
                            <path d="M16 6l-8 4v6c0 5.38 3.84 10.41 8 11.62C20.16 26.41 24 21.38 24 16v-6l-8-4z" fill="#0B0F14" />
                            <path d="M12 16l3 3 5-6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.12em', color: '#E2E8F0' }}>
                            ARES
                        </div>
                        <div style={{ fontSize: '0.55rem', fontWeight: 500, letterSpacing: '0.06em', color: '#64748B', marginTop: -2 }}>
                            ADVERSARIAL RISK SIMULATOR
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 28, background: '#1E3A5F' }} />

                {/* System Status */}
                <div className={`status-badge ${statusClass}`}>
                    <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: statusColor,
                        }}
                    />
                    {systemStatus}
                </div>

                {/* Loading indicator */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        <div className="spinner" />
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{loadingMessage}</span>
                    </motion.div>
                )}
            </div>

            {/* Center: Risk Gauge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.1em', color: '#64748B', textTransform: 'uppercase', lineHeight: 1 }}>
                        Global Risk Index
                    </div>
                    {/* Semi-circular Gauge */}
                    <svg width="90" height="48" viewBox="0 0 90 48">
                        {/* Background arc */}
                        <path
                            d="M 9 44 A 36 36 0 0 1 81 44"
                            fill="none"
                            stroke="#1E3A5F"
                            strokeWidth="5"
                            strokeLinecap="round"
                        />
                        {/* Filled arc */}
                        <motion.path
                            d="M 9 44 A 36 36 0 0 1 81 44"
                            fill="none"
                            stroke={gaugeColor}
                            strokeWidth="5"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: globalRisk / 100 }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            style={{ filter: `drop-shadow(0 0 6px ${gaugeColor}60)` }}
                        />
                        {/* Value text */}
                        <text
                            x="45"
                            y="42"
                            textAnchor="middle"
                            fill={gaugeColor}
                            fontSize="18"
                            fontWeight="800"
                            fontFamily="Inter, sans-serif"
                        >
                            {Math.round(globalRisk)}
                        </text>
                    </svg>
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 28, background: '#1E3A5F' }} />

                {/* Threat Level */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.1em', color: '#64748B', marginBottom: 4, textTransform: 'uppercase' }}>
                        Threat Level
                    </div>
                    <motion.div
                        animate={threatLevel === 'CRITICAL' ? { opacity: [1, 0.5, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            letterSpacing: '0.1em',
                            color: threatColor,
                            textShadow: `0 0 10px ${threatColor}50`,
                        }}
                    >
                        {threatLevel}
                    </motion.div>
                </div>
            </div>

            {/* Right: Timestamp + version */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 500, color: '#64748B', fontVariantNumeric: 'tabular-nums' }}>
                        {new Date().toLocaleTimeString('en-US', { hour12: false })}
                    </div>
                    <div style={{ fontSize: '0.58rem', color: '#475569', marginTop: 1 }}>
                        ARES v1.0.0 | AMD OPTIMIZED
                    </div>
                </div>
            </div>
        </div>
    );
}

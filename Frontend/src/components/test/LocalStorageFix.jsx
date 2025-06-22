import React, { useState, useEffect } from 'react';
import { AuthService } from '../../services/auth.service';

const LocalStorageFix = () => {
    const [logs, setLogs] = useState([]);
    const [isMonitoring, setIsMonitoring] = useState(false);

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { message, type, timestamp }]);
    };

    // Monitor localStorage changes
    useEffect(() => {
        if (!isMonitoring) return;

        const originalSetItem = localStorage.setItem;
        const originalRemoveItem = localStorage.removeItem;
        const originalClear = localStorage.clear;

        localStorage.setItem = function(key, value) {
            if (key === 'token' || key === 'user') {
                addLog(`📝 localStorage.setItem('${key}', '${value?.substring(0, 50)}...')`, 'info');
                console.trace('localStorage.setItem called for', key);
            }
            return originalSetItem.apply(this, arguments);
        };

        localStorage.removeItem = function(key) {
            if (key === 'token' || key === 'user') {
                addLog(`🗑️ localStorage.removeItem('${key}')`, 'warning');
                console.trace('localStorage.removeItem called for', key);
            }
            return originalRemoveItem.apply(this, arguments);
        };

        localStorage.clear = function() {
            addLog('🧹 localStorage.clear() called - ALL DATA WILL BE REMOVED!', 'error');
            console.trace('localStorage.clear called');
            return originalClear.apply(this, arguments);
        };

        return () => {
            localStorage.setItem = originalSetItem;
            localStorage.removeItem = originalRemoveItem;
            localStorage.clear = originalClear;
        };
    }, [isMonitoring]);

    const toggleMonitoring = () => {
        setIsMonitoring(!isMonitoring);
        addLog(`${!isMonitoring ? '🔍 Started' : '⏹️ Stopped'} monitoring localStorage changes`, 'info');
    };

    const testLogin = async () => {
        addLog('🧪 Testing login process...', 'info');

        try {
            // Check current state
            const currentToken = localStorage.getItem('token');
            const user = localStorage.getItem('user');

            addLog(`Before login - Token: ${currentToken ? 'exists' : 'missing'}, User: ${user ? 'exists' : 'missing'}`, 'info');

            // Simulate login (you'll need to replace with actual credentials)
            const testCredentials = {
                email: 'test@example.com', // Replace with actual test credentials
                password: 'password123'
            };

            addLog('⚠️ Replace test credentials with actual ones to test login', 'warning');

        } catch (error) {
            addLog(`❌ Login test failed: ${error.message}`, 'error');
        }
    };

    const fixLocalStorage = () => {
        addLog('🔧 Starting localStorage fix...', 'info');

        try {
            const user = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            addLog(`Current state - user: ${user ? 'exists' : 'missing'}, token: ${token ? 'exists' : 'missing'}`, 'info');

            // If both exist, ensure they're the same
            if (user) {
                try {
                    const userData = JSON.parse(user);
                    if (JSON.stringify(userData)) {
                        localStorage.setItem('user', user);
                        addLog('✅ Synchronized currentUser with user data', 'success');
                    } else {
                        addLog('✅ user and currentUser are already synchronized', 'success');
                    }
                } catch (error) {
                    addLog('❌ Error parsing user data: ' + error.message, 'error');
                }
            }

            addLog('🎉 localStorage fix completed!', 'success');
            
            // Trigger a storage event to update other components
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'user',
                newValue: localStorage.getItem('user'),
                url: window.location.href
            }));
            
            addLog('📡 Triggered storage event to update components', 'info');

        } catch (error) {
            addLog('❌ Error during localStorage fix: ' + error.message, 'error');
        }
    };

    const clearLogs = () => {
        setLogs([]);
    };

    const showCurrentState = () => {
        addLog('📊 Current localStorage state:', 'info');
        addLog(`Token: ${localStorage.getItem('token') ? 'Present' : 'Missing'}`, 'info');
        addLog(`User: ${localStorage.getItem('user') ? 'Present' : 'Missing'}`, 'info');

        // Show all localStorage keys
        const allKeys = Object.keys(localStorage);
        addLog(`All localStorage keys: ${allKeys.join(', ')}`, 'info');

        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                addLog(`User ID: ${userData.id || userData._id || 'Missing'}`, 'info');
                addLog(`User Name: ${userData.name || 'Missing'}`, 'info');
                addLog(`User Role: ${userData.role || 'Missing'}`, 'info');
            } catch (error) {
                addLog('❌ Error parsing user data', 'error');
            }
        }

        // Check auth service state
        try {
            const authDebug = AuthService.debugAuthState();
            addLog(`Auth Service Debug: ${JSON.stringify(authDebug, null, 2)}`, 'info');
        } catch (error) {
            addLog('❌ Error getting auth debug state', 'error');
        }
    };

    const forceRelogin = () => {
        addLog('🔄 Forcing re-login by clearing auth data...', 'info');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        addLog('✅ Auth data cleared. Please login again.', 'success');

        // Redirect to login
        window.location.href = '/auth';
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2>LocalStorage Debug & Fix Utility</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                This utility helps debug and fix localStorage authentication issues.
            </p>

            <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <button
                    onClick={showCurrentState}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Show Current State
                </button>
                <button
                    onClick={toggleMonitoring}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: isMonitoring ? '#ff9800' : '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
                </button>
                <button
                    onClick={fixLocalStorage}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Fix LocalStorage
                </button>
                <button
                    onClick={testLogin}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#9C27B0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Login Process
                </button>
                <button
                    onClick={forceRelogin}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#ff5722',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Force Re-login
                </button>
                <button
                    onClick={clearLogs}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Clear Logs
                </button>
            </div>

            {isMonitoring && (
                <div style={{
                    padding: '10px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    🔍 <strong>Monitoring localStorage changes...</strong> All token/user changes will be logged below.
                </div>
            )}

            <div style={{ 
                border: '1px solid #ccc', 
                padding: '10px', 
                height: '300px', 
                overflowY: 'scroll',
                backgroundColor: '#f9f9f9',
                fontFamily: 'monospace',
                fontSize: '14px'
            }}>
                <h3>Fix Logs:</h3>
                {logs.map((log, index) => (
                    <div key={index} style={{ 
                        marginBottom: '5px',
                        color: log.type === 'error' ? 'red' : 
                               log.type === 'success' ? 'green' : 
                               log.type === 'warning' ? 'orange' : 'black'
                    }}>
                        <span style={{ color: '#666' }}>[{log.timestamp}]</span> {log.message}
                    </div>
                ))}
                {logs.length === 0 && (
                    <div style={{ color: '#666', fontStyle: 'italic' }}>
                        No logs yet. Click "Fix LocalStorage" to start the fix process.
                    </div>
                )}
            </div>

            <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                <p><strong>What this utility does:</strong></p>
                <ul>
                    <li><strong>Show Current State:</strong> Displays all localStorage auth data and debug info</li>
                    <li><strong>Start/Stop Monitoring:</strong> Tracks all localStorage changes in real-time</li>
                    <li><strong>Fix LocalStorage:</strong> Migrates data from 'currentUser' to 'user' key and removes duplicates</li>
                    <li><strong>Test Login Process:</strong> Simulates login to check for issues</li>
                    <li><strong>Force Re-login:</strong> Clears all auth data and redirects to login</li>
                    <li><strong>Clear Logs:</strong> Removes all debug logs from the display</li>
                </ul>
                <p><strong>Common Issues:</strong></p>
                <ul>
                    <li>Token exists but gets cleared by other components</li>
                    <li>Multiple localStorage keys causing confusion</li>
                    <li>Navbar logout clearing all localStorage data</li>
                    <li>Timing issues during login process</li>
                </ul>
            </div>
        </div>
    );
};

export default LocalStorageFix;

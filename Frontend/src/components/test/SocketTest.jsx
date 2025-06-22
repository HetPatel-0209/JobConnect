import React, { useState, useEffect } from 'react';
import socketService from '../../services/socket.service';

const SocketTest = () => {
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [logs, setLogs] = useState([]);
    const [token, setToken] = useState('');

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { message, type, timestamp }]);
    };

    useEffect(() => {
        // Set up event listeners
        const handleConnect = () => {
            setConnectionStatus('Connected');
            addLog('✅ Socket connected successfully', 'success');
        };

        const handleDisconnect = () => {
            setConnectionStatus('Disconnected');
            addLog('❌ Socket disconnected', 'error');
        };

        const handleConnectError = (error) => {
            setConnectionStatus('Connection Error');
            addLog(`🚫 Connection error: ${error.message || error}`, 'error');
        };

        const handleAuthenticated = (data) => {
            setConnectionStatus('Authenticated');
            addLog('🔐 Socket authenticated successfully', 'success');
            addLog(`User: ${data.user?.name || 'Unknown'}`, 'info');
        };

        const handleAuthError = (error) => {
            addLog(`🔒 Authentication error: ${error.message || error}`, 'error');
        };

        // Register event listeners
        socketService.on('connect', handleConnect);
        socketService.on('disconnect', handleDisconnect);
        socketService.on('connect_error', handleConnectError);
        socketService.on('authenticated', handleAuthenticated);
        socketService.on('auth_error', handleAuthError);

        // Check initial connection status
        if (socketService.isSocketConnected()) {
            setConnectionStatus('Connected & Authenticated');
        }

        return () => {
            socketService.off('connect', handleConnect);
            socketService.off('disconnect', handleDisconnect);
            socketService.off('connect_error', handleConnectError);
            socketService.off('authenticated', handleAuthenticated);
            socketService.off('auth_error', handleAuthError);
        };
    }, []);

    const testConnection = () => {
        addLog('🚀 Testing connection to Render backend...', 'info');
        const testToken = token || localStorage.getItem('token');
        
        if (!testToken) {
            addLog('⚠️ No token found. Please login first or enter a token.', 'warning');
            return;
        }

        socketService.connect(testToken);
    };

    const disconnect = () => {
        addLog('🔌 Disconnecting socket...', 'info');
        socketService.disconnect();
        setConnectionStatus('Disconnected');
    };

    const clearLogs = () => {
        setLogs([]);
    };

    const checkHealth = () => {
        addLog('🏥 Checking connection health...', 'info');
        const isHealthy = socketService.checkConnectionHealth();
        addLog(`Health check result: ${isHealthy ? 'Healthy' : 'Unhealthy'}`, isHealthy ? 'success' : 'error');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Socket.IO Connection Test</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <strong>Status: </strong>
                <span style={{ 
                    color: connectionStatus.includes('Connected') ? 'green' : 
                           connectionStatus.includes('Error') ? 'red' : 'orange',
                    fontWeight: 'bold'
                }}>
                    {connectionStatus}
                </span>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Enter token (optional - will use localStorage)"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    style={{ width: '300px', marginRight: '10px', padding: '5px' }}
                />
                <button onClick={testConnection} style={{ marginRight: '10px', padding: '5px 10px' }}>
                    Connect
                </button>
                <button onClick={disconnect} style={{ marginRight: '10px', padding: '5px 10px' }}>
                    Disconnect
                </button>
                <button onClick={checkHealth} style={{ marginRight: '10px', padding: '5px 10px' }}>
                    Health Check
                </button>
                <button onClick={clearLogs} style={{ padding: '5px 10px' }}>
                    Clear Logs
                </button>
            </div>

            <div style={{ 
                border: '1px solid #ccc', 
                padding: '10px', 
                height: '400px', 
                overflowY: 'scroll',
                backgroundColor: '#f9f9f9',
                fontFamily: 'monospace'
            }}>
                <h3>Connection Logs:</h3>
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
                        No logs yet. Click "Connect" to test the Socket.IO connection.
                    </div>
                )}
            </div>

            <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                <p><strong>Backend URL:</strong> https://jobconnect-xwh3.onrender.com</p>
                <p><strong>Socket.IO Path:</strong> /socket.io/</p>
                <p><strong>Transport:</strong> polling → websocket (upgrade)</p>
            </div>
        </div>
    );
};

export default SocketTest;

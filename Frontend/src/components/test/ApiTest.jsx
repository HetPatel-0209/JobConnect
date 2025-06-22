import React, { useState, useEffect } from 'react';
import { JobService } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const ApiTest = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { message, type, timestamp }]);
    };

    const clearLogs = () => {
        setLogs([]);
    };

    const testHealthEndpoint = async () => {
        addLog('🏥 Testing health endpoint...', 'info');
        setLoading(true);
        try {
            const response = await fetch('https://jobconnect-xwh3.onrender.com/api/health');
            const data = await response.json();
            addLog(`✅ Health check successful: ${data.message}`, 'success');
            addLog(`Environment: ${data.environment}`, 'info');
            addLog(`CORS Origins: ${data.corsOrigins?.join(', ')}`, 'info');
        } catch (error) {
            addLog(`❌ Health check failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const testJobsEndpoint = async () => {
        addLog('📋 Testing jobs endpoint...', 'info');
        setLoading(true);
        try {
            const response = await JobService.getAllJobs({ page: 1, limit: 5 });
            addLog(`✅ Jobs fetched successfully: ${response.data?.length || 0} jobs`, 'success');
            if (response.data && response.data.length > 0) {
                addLog(`First job: ${response.data[0].title}`, 'info');
            }
        } catch (error) {
            addLog(`❌ Jobs fetch failed: ${error.message}`, 'error');
            addLog(`Error details: ${JSON.stringify(error.response?.data || error)}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const testAuthEndpoint = async () => {
        addLog('🔐 Testing auth endpoint...', 'info');
        setLoading(true);
        try {
            if (!user) {
                addLog('⚠️ No user logged in, cannot test auth endpoint', 'warning');
                return;
            }
            const response = await AuthService.getProfile();
            addLog(`✅ Profile fetched successfully: ${response.data?.name || 'Unknown'}`, 'success');
        } catch (error) {
            addLog(`❌ Profile fetch failed: ${error.message}`, 'error');
            addLog(`Error details: ${JSON.stringify(error.response?.data || error)}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const testRawApiCall = async () => {
        addLog('🔧 Testing raw API call...', 'info');
        setLoading(true);
        try {
            const response = await apiService.get('/jobs', { page: 1, limit: 3 });
            addLog(`✅ Raw API call successful`, 'success');
            addLog(`Response structure: ${JSON.stringify(Object.keys(response))}`, 'info');
        } catch (error) {
            addLog(`❌ Raw API call failed: ${error.message}`, 'error');
            addLog(`Error details: ${JSON.stringify(error.response?.data || error)}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const testCorsHeaders = async () => {
        addLog('🌐 Testing CORS headers...', 'info');
        setLoading(true);
        try {
            const response = await fetch('https://jobconnect-xwh3.onrender.com/api/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': 'http://localhost:5173'
                }
            });
            
            const corsHeaders = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            };
            
            addLog(`✅ CORS test completed`, 'success');
            addLog(`CORS Headers: ${JSON.stringify(corsHeaders)}`, 'info');
        } catch (error) {
            addLog(`❌ CORS test failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        addLog('🚀 API Test Component initialized', 'info');
        addLog(`Current user: ${user ? user.name || user.email : 'Not logged in'}`, 'info');
        addLog(`API Base URL: ${import.meta.env.VITE_BACKEND_API_BASE_URL}`, 'info');
        addLog(`Environment: ${import.meta.env.MODE}`, 'info');
    }, [user]);

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>API Connection Test</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={testHealthEndpoint} 
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '8px 16px' }}
                >
                    Test Health
                </button>
                <button 
                    onClick={testJobsEndpoint} 
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '8px 16px' }}
                >
                    Test Jobs API
                </button>
                <button 
                    onClick={testAuthEndpoint} 
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '8px 16px' }}
                >
                    Test Auth API
                </button>
                <button 
                    onClick={testRawApiCall} 
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '8px 16px' }}
                >
                    Test Raw API
                </button>
                <button 
                    onClick={testCorsHeaders} 
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '8px 16px' }}
                >
                    Test CORS
                </button>
                <button 
                    onClick={clearLogs} 
                    style={{ padding: '8px 16px' }}
                >
                    Clear Logs
                </button>
            </div>

            {loading && (
                <div style={{ 
                    padding: '10px', 
                    backgroundColor: '#f0f8ff', 
                    border: '1px solid #0066cc',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    🔄 Testing in progress...
                </div>
            )}

            <div style={{ 
                border: '1px solid #ccc', 
                padding: '10px', 
                height: '400px', 
                overflowY: 'scroll',
                backgroundColor: '#f9f9f9',
                fontFamily: 'monospace',
                fontSize: '14px'
            }}>
                <h3>Test Logs:</h3>
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
                        No logs yet. Click a test button to start testing.
                    </div>
                )}
            </div>

            <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                <p><strong>Backend URL:</strong> https://jobconnect-xwh3.onrender.com</p>
                <p><strong>API Base:</strong> {import.meta.env.VITE_BACKEND_API_BASE_URL}</p>
                <p><strong>User Status:</strong> {user ? 'Logged In' : 'Not Logged In'}</p>
                <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
            </div>
        </div>
    );
};

export default ApiTest;

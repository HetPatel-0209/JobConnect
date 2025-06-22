import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AuthDebug = () => {
    const { user, debugAuth } = useAuth();

    const handleDebugClick = () => {
        const debugInfo = debugAuth();
        console.log('🔍 Manual Auth Debug:', debugInfo);
        
        // Also check current localStorage state
        console.log('📦 Current localStorage contents:', {
            token: localStorage.getItem('token'),
            user: localStorage.getItem('user'),
            allKeys: Object.keys(localStorage)
        });
    };

    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔍 Auth Debug Panel</h3>
            <div className="space-y-2 text-sm">
                <div>
                    <strong>Context User:</strong> {user ? `${user.name} (${user.role})` : 'None'}
                </div>
                <div>
                    <strong>User ID:</strong> {user?.id || user?._id || 'None'}
                </div>
                <div>
                    <strong>Has Token:</strong> {localStorage.getItem('token') ? '✅ Yes' : '❌ No'}
                </div>
                <div>
                    <strong>Has User Data:</strong> {localStorage.getItem('user') ? '✅ Yes' : '❌ No'}
                </div>
                <button
                    onClick={handleDebugClick}
                    className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                >
                    Debug Auth State
                </button>
            </div>
        </div>
    );
};

export default AuthDebug;

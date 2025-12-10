import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthDebugPanel() {
  const { currentUser, loading } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] max-w-sm">
      <Card className="bg-black/90 text-white border-yellow-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-yellow-400">🔍 Auth Debug</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1">
          <div>
            <strong>Loading:</strong> {loading ? '🔄 Yes' : '✅ No'}
          </div>
          <div>
            <strong>User:</strong> {currentUser ? '✅ Authenticated' : '❌ Not authenticated'}
          </div>
          {currentUser && (
            <>
              <div>
                <strong>Email:</strong> {currentUser.email}
              </div>
              <div>
                <strong>Role:</strong> {currentUser.role || 'N/A'}
              </div>
              <div>
                <strong>Name:</strong> {currentUser.first_name} {currentUser.last_name}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

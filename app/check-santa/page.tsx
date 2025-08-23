'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppState } from '@/app/features/santa/types';
import { getAssignment } from '@/app/features/santa/logic';

export default function CheckSanta() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [userName, setUserName] = useState('');
  const [assignment, setAssignment] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  // Load saved state from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('secretSantaState');
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        setAppState(parsedState);
      } catch (e) {
        console.error('Failed to parse saved state:', e);
        setError('Failed to load saved data');
      }
    } else {
      setError('No assignment data found. Please complete the assignment process first.');
    }
  }, []);

  const handleCheckAssignment = () => {
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!appState) {
      setError('No assignment data available');
      return;
    }

    const foundAssignment = getAssignment(appState, userName);
    
    if (foundAssignment) {
      setAssignment(foundAssignment);
      setError('');
    } else {
      setAssignment(null);
      setError(`No assignment found for "${userName}". Make sure you've completed the assignment process and spelled your name correctly.`);
    }
    
    setSearched(true);
  };

  const resetSearch = () => {
    setUserName('');
    setAssignment(null);
    setError('');
    setSearched(false);
  };

  if (!appState && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-green-800 mb-4">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-4">
            🔍 Check Your Secret Santa
          </h1>
          <Link href="/">
            <Button variant="outline" className="mb-4">
              ← Back to Home
            </Button>
          </Link>
        </div>

        {appState && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-800">
                <strong>Total Assignments:</strong> {appState.completedAssignments.length} people have been assigned
              </p>
              <p className="text-sm text-blue-600 mt-1">
                People with assignments: {Object.keys(appState.assignments).join(', ') || 'None yet'}
              </p>
            </CardContent>
          </Card>
        )}

        {!searched && (
          <Card>
            <CardHeader>
              <CardTitle>Who are you?</CardTitle>
              <CardDescription>
                Enter your name to look up your secret santa assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCheckAssignment()}
              />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <Button onClick={handleCheckAssignment} className="w-full">
                Check My Assignment
              </Button>
            </CardContent>
          </Card>
        )}

        {searched && assignment && (
          <Card className="border-2 border-green-300 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">🎁 Your Secret Santa</CardTitle>
              <CardDescription>
                Here's who you're getting a gift for!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-white rounded-lg border-2 border-green-200">
                <p className="text-lg text-gray-600 mb-2">{userName}, your secret santa is:</p>
                <p className="text-3xl font-bold text-green-800">{assignment}</p>
              </div>
              <p className="text-sm text-green-700 text-center">
                🎄 Happy shopping! 🎄
              </p>
              <div className="space-y-2">
                <Button onClick={resetSearch} className="w-full" variant="outline">
                  Look Up Another Person
                </Button>
                <Link href="/">
                  <Button className="w-full">
                    ← Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {searched && !assignment && (
          <Card className="border-2 border-yellow-300 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">❌ No Assignment Found</CardTitle>
              <CardDescription>
                We couldn't find a secret santa assignment for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && <p className="text-yellow-700">{error}</p>}
              <p className="text-sm text-yellow-700">
                Possible reasons:
              </p>
              <ul className="text-sm text-yellow-600 list-disc list-inside space-y-1">
                <li>You haven't completed the assignment process yet</li>
                <li>Your name was spelled differently when you made the assignment</li>
                <li>The assignment data has been reset</li>
              </ul>
              <div className="space-y-2">
                <Button onClick={resetSearch} className="w-full" variant="outline">
                  Try Again
                </Button>
                <Link href="/assign_santas">
                  <Button className="w-full">
                    Go to Assignment Page
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show all assignments for debugging/admin purposes */}
        {appState && Object.keys(appState.assignments).length > 0 && (
          <Card className="mt-8 border-gray-300">
            <CardHeader>
              <CardTitle className="text-gray-700">All Current Assignments</CardTitle>
              <CardDescription>
                For family reference (admin view)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(appState.assignments).map(([giver, receiver]) => (
                  <div key={giver} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{giver}</span>
                    <span className="text-gray-600">→</span>
                    <span className="font-medium">{receiver}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
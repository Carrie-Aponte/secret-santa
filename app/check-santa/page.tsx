'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppState } from '@/app/features/santa/types';
import { FAMILY_MEMBERS } from '@/app/features/santa/constants';
import { getAssignment } from '@/app/features/santa/logic';
import { DatabaseService } from '@/lib/database';

export default function CheckSanta() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [userName, setUserName] = useState('');
  const [assignment, setAssignment] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPrivacyWarning, setShowPrivacyWarning] = useState(false);

  // Load saved state from database on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const savedState = await DatabaseService.loadAppState();
        if (savedState) {
          setAppState(savedState);
        } else {
          setError('No assignment data found. Please complete the assignment process first.');
        }
      } catch (error) {
        console.error('Failed to load data from database:', error);
        setError('Failed to load data from database.');
        // Fallback to localStorage
        const localData = localStorage.getItem('secretSantaState');
        if (localData) {
          try {
            const parsedState = JSON.parse(localData);
            setAppState(parsedState);
            setError(''); // Clear error if local data works
          } catch (e) {
            console.error('Failed to parse local data:', e);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCheckAssignment = () => {
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    // Validate that the user is in the family members list
    if (!FAMILY_MEMBERS.includes(userName)) {
      setError(`"${userName}" is not in the family list. Please use the exact name from the list.`);
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
      setShowPrivacyWarning(true);
    } else {
      setAssignment(null);
      setError(`No assignment found for "${userName}". Make sure you&apos;ve completed the assignment process first.`);
      setSearched(true);
    }
  };

  const resetSearch = () => {
    setUserName('');
    setAssignment(null);
    setError('');
    setSearched(false);
    setShowPrivacyWarning(false);
  };

  if (!appState && !error && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-4">Loading...</h1>
            <p className="text-blue-600">🔄 Loading data from database...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-4">
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
                Click on your name from the family members below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {FAMILY_MEMBERS.map((name) => (
                  <Button
                    key={name}
                    variant={userName === name ? "default" : "outline"}
                    className={`p-4 h-auto text-left justify-start ${
                      userName === name ? 'bg-green-600 hover:bg-green-700' : ''
                    } ${
                      appState && !appState.assignments[name] ? 'opacity-60' : ''
                    }`}
                    onClick={() => setUserName(name)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{name}</span>
                      {appState && appState.assignments[name] && (
                        <span className="text-xs opacity-75">✓ Has assignment</span>
                      )}
                      {appState && !appState.assignments[name] && (
                        <span className="text-xs opacity-75">No assignment yet</span>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <Button 
                onClick={handleCheckAssignment} 
                className="w-full"
                disabled={!userName}
              >
                Check Assignment for {userName || '...'}
              </Button>
            </CardContent>
          </Card>
        )}

        {showPrivacyWarning && assignment && (
          <Card className="border-2 border-amber-300 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-800">⚠️ Privacy Check!</CardTitle>
              <CardDescription>
                Make sure nobody is looking at your screen before revealing your assignment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-white rounded-lg border-2 border-amber-200">
                <p className="text-lg text-gray-600 mb-4">
                  Make sure nobody is looking!
                </p>
                <Button 
                  onClick={() => {
                    setShowPrivacyWarning(false);
                    setSearched(true);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Click here to reveal your Secret Santa
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {searched && assignment && !showPrivacyWarning && (
          <Card className="border-2 border-green-300 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">🎁 Your Secret Santa</CardTitle>
              <CardDescription>
                Here&apos;s who you&apos;re getting a gift for!
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
                We couldn&apos;t find a secret santa assignment for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && <p className="text-yellow-700">{error}</p>}
              <p className="text-sm text-yellow-700">
                Possible reasons:
              </p>
              <ul className="text-sm text-yellow-600 list-disc list-inside space-y-1">
                <li>You haven&apos;t completed the assignment process yet</li>
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
      </div>
    </div>
  );
}
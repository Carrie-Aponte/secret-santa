'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppState, AssignmentStep } from '@/app/features/santa/types';
import { FAMILY_MEMBERS } from '@/app/features/santa/constants';
import { 
  initializeAppState, 
  addKnownAssignment, 
  generateAssignment 
} from '@/app/features/santa/logic';
import { DatabaseService } from '@/lib/database';

export default function AssignSantas() {
  const [appState, setAppState] = useState<AppState>(() => 
    initializeAppState(FAMILY_MEMBERS)
  );
  const [currentStep, setCurrentStep] = useState<AssignmentStep>('initial');
  const [userName, setUserName] = useState('');
  const [santaName, setSantaName] = useState('');
  const [assignedSanta, setAssignedSanta] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load saved state from database on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const savedState = await DatabaseService.loadAppState();
        if (savedState) {
          setAppState(savedState);
        }
      } catch (error) {
        console.error('Failed to load data from database:', error);
        setError('Failed to load data. Using offline mode.');
        // Fallback to localStorage
        const localData = localStorage.getItem('secretSantaState');
        if (localData) {
          try {
            const parsedState = JSON.parse(localData);
            setAppState(parsedState);
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

  // Save state to database whenever it changes
  useEffect(() => {
    const saveData = async () => {
      try {
        await DatabaseService.saveAppState(appState);
        // Also save to localStorage as backup
        localStorage.setItem('secretSantaState', JSON.stringify(appState));
      } catch (error) {
        console.error('Failed to save to database:', error);
        // Fallback to localStorage only
        localStorage.setItem('secretSantaState', JSON.stringify(appState));
      }
    };

    // Only save if we have assignments (avoid saving initial empty state)
    if (Object.keys(appState.assignments).length > 0) {
      saveData();
    }
  }, [appState]);

  const handleStartAssignment = () => {
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    // Validate that the user is in the family members list
    if (!FAMILY_MEMBERS.includes(userName)) {
      setError(`"${userName}" is not in the family list. Please use the exact name from the list above.`);
      return;
    }
    
    // Check if this person already has an assignment
    if (appState.assignments[userName]) {
      setError(`${userName} already has a secret santa assignment!`);
      return;
    }
    
    setError('');
    setCurrentStep('knows-santa');
  };

  const handleKnowsSanta = (knows: boolean) => {
    if (knows) {
      setCurrentStep('enter-santa');
    } else {
      setCurrentStep('generate-santa');
    }
  };

  const handleEnterKnownSanta = () => {
    if (!santaName.trim()) {
      setError('Please enter the name of your secret santa');
      return;
    }

    if (!appState.familyMembers.includes(santaName)) {
      setError('That person is not in the family list');
      return;
    }

    if (!appState.availableReceivers.includes(santaName)) {
      setError('That person has already been assigned as someone\'s secret santa');
      return;
    }

    if (santaName === userName) {
      setError('You cannot be your own secret santa!');
      return;
    }

    const newState = addKnownAssignment(appState, userName, santaName);
    setAppState(newState);
    setAssignedSanta(santaName);
    setError('');
    setCurrentStep('complete');
  };

  const handleGenerateSanta = () => {
    const { newState, receiver } = generateAssignment(appState, userName);
    
    if (!receiver) {
      setError('No available people left to assign! This shouldn\'t happen.');
      return;
    }

    setAppState(newState);
    setAssignedSanta(receiver);
    setError('');
    setCurrentStep('complete');
  };

  const resetFlow = () => {
    setCurrentStep('initial');
    setUserName('');
    setSantaName('');
    setAssignedSanta(null);
    setError('');
  };

  const clearAllData = async () => {
    if (confirm('Are you sure you want to reset all assignments? This cannot be undone.')) {
      setLoading(true);
      try {
        await DatabaseService.resetAppState();
        const newState = initializeAppState(FAMILY_MEMBERS);
        setAppState(newState);
        localStorage.removeItem('secretSantaState');
        resetFlow();
      } catch (error) {
        console.error('Failed to reset database:', error);
        setError('Failed to reset database. Try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-4">
            🎁 Secret Santa Assignment
          </h1>
          {loading && (
            <div className="mb-4 text-blue-600">
              <p>🔄 Syncing with database...</p>
            </div>
          )}
          <Link href="/">
            <Button variant="outline" className="mb-4">
              ← Back to Home
            </Button>
          </Link>
        </div>

        {/* Progress Info */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Status:</strong> {appState.completedAssignments.length} of {FAMILY_MEMBERS.length} assignments completed
            </p>
            <p className="text-sm text-blue-600">
              People with assignments: {Object.keys(appState.assignments).join(', ') || 'None yet'}
            </p>
          </CardContent>
        </Card>

        {currentStep === 'initial' && (
          <Card>
            <CardHeader>
              <CardTitle>Who are you?</CardTitle>
              <CardDescription>
                Enter your name exactly as it appears in the family list below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Family Members:</p>
                <p className="text-sm text-gray-600">{FAMILY_MEMBERS.join(', ')}</p>
              </div>
              <Input
                placeholder="Enter your name exactly as shown above"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStartAssignment()}
              />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <Button onClick={handleStartAssignment} className="w-full">
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === 'knows-santa' && (
          <Card>
            <CardHeader>
              <CardTitle>Hi {userName}!</CardTitle>
              <CardDescription>
                Do you already know who your secret santa is?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleKnowsSanta(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Yes, I know
                </Button>
                <Button 
                  onClick={() => handleKnowsSanta(false)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  No, I forgot
                </Button>
              </div>
              <Button variant="outline" onClick={resetFlow} className="w-full">
                ← Go Back
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === 'enter-santa' && (
          <Card>
            <CardHeader>
              <CardTitle>Enter Your Secret Santa</CardTitle>
              <CardDescription>
                Who is your secret santa? This will remove them from the available pool.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Family Members:</p>
                <p className="text-sm text-gray-600">{FAMILY_MEMBERS.join(', ')}</p>
              </div>
              <Input
                placeholder="Enter their name exactly as shown above"
                value={santaName}
                onChange={(e) => setSantaName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEnterKnownSanta()}
              />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="space-y-2">
                <Button onClick={handleEnterKnownSanta} className="w-full">
                  Confirm Assignment
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep('knows-santa')} className="w-full">
                  ← Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'generate-santa' && (
          <Card>
            <CardHeader>
              <CardTitle>Generate Your Secret Santa</CardTitle>
              <CardDescription>
                Click the button below to randomly assign you a secret santa from the available family members!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                You will be randomly assigned a family member who hasn't been taken yet.
              </p>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="space-y-2">
                <Button 
                  onClick={handleGenerateSanta} 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  🎲 Generate My Secret Santa!
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep('knows-santa')} className="w-full">
                  ← Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'complete' && assignedSanta && (
          <Card className="border-2 border-green-300 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">🎉 Assignment Complete!</CardTitle>
              <CardDescription>
                Remember this person - they're your secret santa!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-white rounded-lg border-2 border-green-200">
                <p className="text-lg text-gray-600 mb-2">Your secret santa is:</p>
                <p className="text-3xl font-bold text-green-800">{assignedSanta}</p>
              </div>
              <p className="text-sm text-green-700 text-center">
                Don't forget! You can always check this later from the home page.
              </p>
              <div className="space-y-2">
                <Button onClick={resetFlow} className="w-full">
                  Let Another Family Member Assign their Secret Santa
                </Button>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    ← Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Controls */}
        <Card className="mt-8 border-gray-300">
          <CardHeader>
            <CardTitle className="text-gray-700">Admin Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={clearAllData} 
              variant="outline" 
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
            >
              🗑️ Reset All Assignments
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


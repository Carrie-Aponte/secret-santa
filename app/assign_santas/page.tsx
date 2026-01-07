'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppState, AssignmentStep } from '@/app/features/santa/types';
import { FAMILY_MEMBERS } from '@/app/features/santa/constants';
import { 
  initializeAppState, 
  addKnownAssignment, 
  generateAssignment,
  isInvalidAssignment
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
  const [showPrivacyWarning, setShowPrivacyWarning] = useState(false);
  const [tempAssignment, setTempAssignment] = useState<{giver: string, receiver: string} | null>(null);

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

    const handleManualAssignment = (santaName: string, isKnownAssignment = false) => {
    // Check for invalid assignments using our validation function
    if (isInvalidAssignment(userName, santaName)) {
      if (santaName === userName) {
        setError('You cannot be your own secret santa!');
      } else {
        setError(`You cannot have ${santaName} again - you had them last year!`);
      }
      return;
    }

    // Check if this person is already taken by someone else
    const isAlreadyTaken = Object.values(appState.assignments).includes(santaName);
    if (isAlreadyTaken) {
      setError(`${santaName} is already assigned to someone else. Please choose someone else.`);
      return;
    }

    const newState = addKnownAssignment(appState, userName, santaName);
    setAppState(newState);
    setAssignedSanta(santaName);
    setError('');
    
    if (isKnownAssignment) {
      // If they already knew their assignment, skip privacy warning and go directly to complete
      setCurrentStep('complete');
    } else {
      // If this is a new assignment, show privacy warning
      setShowPrivacyWarning(true);
    }
  };

  const handleGenerateSanta = () => {
    setError(''); // Clear any previous errors
    setLoading(true); // Show loading state during generation
    
    // Use setTimeout to allow UI to update with loading state
    setTimeout(() => {
      const { receiver, error } = generateAssignment(appState, userName);
      
      if (!receiver) {
        setError(error || 'No available people left to assign! This shouldn&apos;t happen.');
        setLoading(false);
        return;
      }

      // Don't save to state yet - store as temp assignment until viewed
      setTempAssignment({giver: userName, receiver});
      setAssignedSanta(receiver);
      setError(''); // Clear any previous errors
      setLoading(false);
      setShowPrivacyWarning(true);
    }, 100); // Small delay to show loading state
  };

  const resetFlow = () => {
    setCurrentStep('initial');
    setUserName('');
    setSantaName('');
    setAssignedSanta(null);
    setError('');
    setTempAssignment(null);
  };

//   const clearAllData = async () => {
//     if (confirm('Are you sure you want to reset all assignments? This cannot be undone.')) {
//       setLoading(true);
//       try {
//         await DatabaseService.resetAppState();
//         const newState = initializeAppState(FAMILY_MEMBERS);
//         setAppState(newState);
//         localStorage.removeItem('secretSantaState');
//         resetFlow();
//       } catch (error) {
//         console.error('Failed to reset database:', error);
//         setError('Failed to reset database. Try again later.');
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-4">
            🎁 Secret Santa Assignment
          </h1>
          {loading && (
            <div className="mb-4 text-blue-600">
              <p>🔄 Syncing with database...</p>
            </div>
          )}
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
                      appState.assignments[name] ? 'opacity-50' : ''
                    }`}
                    onClick={() => setUserName(name)}
                    disabled={appState.assignments[name] ? true : false}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{name}</span>
                      {appState.assignments[name] && (
                        <span className="text-xs opacity-75">Already has a Secret Santa</span>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <Button 
                onClick={handleStartAssignment} 
                className="w-full"
                disabled={!userName}
              >
                Continue as {userName || '...'}
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === 'knows-santa' && (
          <Card>
            <CardHeader>
              <CardTitle>Hi {userName}!</CardTitle>
              <CardDescription>
                Do you already know who you&apos;re buying a Secret Santa gift for?
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
                  No, I don&apos;t know
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
              <CardTitle>Who are you buying a gift for?</CardTitle>
              <CardDescription>
                Click on the name of the person you&apos;re buying a Secret Santa gift for.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {FAMILY_MEMBERS.filter(name => name !== userName).map((name) => (
                  <Button
                    key={name}
                    variant={santaName === name ? "default" : "outline"}
                    className={`p-4 h-auto text-left justify-start ${
                      santaName === name ? 'bg-green-600 hover:bg-green-700' : ''
                    }`}
                    onClick={() => setSantaName(name)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{name}</span>
                    </div>
                  </Button>
                ))}
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="space-y-2">
                <Button 
                  onClick={() => handleManualAssignment(santaName, true)} 
                  className="w-full"
                  disabled={!santaName}
                >
                  Confirm: I&apos;m buying a gift for {santaName || '...'}
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
                You will be randomly assigned a family member who hasn&apos;t been taken yet.
              </p>
              {loading && (
                <p className="text-blue-600 text-sm">
                  🎲 Generating your assignment...
                </p>
              )}
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="space-y-2">
                <Button 
                  onClick={handleGenerateSanta} 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? '🔄 Generating...' : '🎲 Generate My Secret Santa!'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep('knows-santa')} 
                  className="w-full"
                  disabled={loading}
                >
                  ← Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showPrivacyWarning && assignedSanta && (
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
                    // Only save the assignment when they actually view it
                    if (tempAssignment) {
                      const newState = addKnownAssignment(appState, tempAssignment.giver, tempAssignment.receiver);
                      setAppState(newState);
                      setTempAssignment(null);
                    }
                    setShowPrivacyWarning(false);
                    setCurrentStep('complete');
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Click here to reveal your Secret Santa
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'complete' && assignedSanta && !showPrivacyWarning && (
          <Card className="border-2 border-green-300 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">🎉 Assignment Complete!</CardTitle>
              <CardDescription>
                Remember this person - they&apos;re your secret santa!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-white rounded-lg border-2 border-green-200">
                <p className="text-lg text-gray-600 mb-2">Your secret santa is:</p>
                <p className="text-3xl font-bold text-green-800">{assignedSanta}</p>
              </div>
              <p className="text-sm text-green-700 text-center">
                Don&apos;t forget! You can always check this later from the home page.
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
        {/* <Card className="mt-8 border-gray-300">
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
        </Card> */}

        {/* Back to Home Button - Always visible at bottom */}
        <div className="mt-8 text-center">
          <Link href="/">
            <Button 
              variant="outline" 
              className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 px-6 py-3 text-lg font-medium shadow-md"
            >
              ← Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


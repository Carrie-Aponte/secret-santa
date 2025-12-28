// here lives the basic app logic (assignSanta, isAvailable, etc)

import { AppState } from './types';
import { LAST_YEAR_ASSIGNMENTS } from './constants';

// Check if an assignment is invalid (self-assignment or same as last year)
export function isInvalidAssignment(giver: string, receiver: string): boolean {
  // Self-assignment is invalid
  if (giver === receiver) {
    return true;
  }
  
  // Same as last year is invalid
  const lastYearSanta = LAST_YEAR_ASSIGNMENTS[giver];
  if (lastYearSanta && receiver === lastYearSanta) {
    return true;
  }
  
  return false;
}

// Check if all remaining unassigned people will still have valid options
export function wouldAssignmentLeaveEveryoneWithOptions(
  state: AppState,
  giver: string,
  receiver: string
): boolean {
  // Simulate making this assignment
  const newAvailable = state.availableReceivers.filter(r => r !== receiver);
  const newAssignments = { ...state.assignments, [giver]: receiver };
  
  // Find all people who still need assignments
  const stillNeedAssignments = state.familyMembers.filter(member => 
    !newAssignments[member]
  );
  
  // For each person who still needs an assignment, 
  // make sure they have at least one valid option
  for (const futureGiver of stillNeedAssignments) {
    const lastYearSanta = LAST_YEAR_ASSIGNMENTS[futureGiver];
    const validOptionsForThem = newAvailable.filter(option =>
      option !== futureGiver && option !== lastYearSanta
    );
    
    // If this person would have NO valid options, this assignment is bad
    if (validOptionsForThem.length === 0) {
      return false;
    }
  }
  
  return true; // Everyone still has at least one valid option
}

export function assignRandomSanta(
  participants: string[],
  available: string[],
  you: string
): string | null {
  const lastYearSanta = LAST_YEAR_ASSIGNMENTS[you];
  const availablePool = available.filter((p) => 
    p !== you && p !== lastYearSanta
  );
  if (availablePool.length === 0) return null;
  
  const assignedSanta =
    availablePool[Math.floor(Math.random() * availablePool.length)];
  return assignedSanta || null;
}

// Smart assignment that ensures future assignments remain possible
export function assignRandomSantaWithLookAhead(
  state: AppState,
  giver: string
): string | null {
  const lastYearSanta = LAST_YEAR_ASSIGNMENTS[giver];
  const basicOptions = state.availableReceivers.filter((p) => 
    p !== giver && p !== lastYearSanta
  );
  
  if (basicOptions.length === 0) return null;
  
  // Filter to only options that keep everyone else with valid choices
  const safeOptions = basicOptions.filter(receiver =>
    wouldAssignmentLeaveEveryoneWithOptions(state, giver, receiver)
  );
  
  // If we have safe options, use one randomly
  if (safeOptions.length > 0) {
    return safeOptions[Math.floor(Math.random() * safeOptions.length)];
  }
  
  // If no "safe" options exist, we need to be more careful
  // This indicates a potential deadlock scenario
  console.warn(`Warning: No completely safe options for ${giver}, assignment may lead to deadlock`);
  return null; // Return null instead of proceeding with unsafe options
}

export function initializeAppState(familyMembers: string[]): AppState {
  return {
    familyMembers: [...familyMembers],
    availableReceivers: [...familyMembers],
    assignments: {},
    completedAssignments: []
  };
}

export function addKnownAssignment(
  state: AppState,
  giver: string,
  receiver: string
): AppState {
  const newState = { ...state };
  newState.assignments[giver] = receiver;
  newState.availableReceivers = newState.availableReceivers.filter(name => name !== receiver);
  newState.completedAssignments = [...newState.completedAssignments, { giver, receiver }];
  return newState;
}

export function generateAssignment(
  state: AppState,
  giver: string
): { newState: AppState; receiver: string | null; error?: string } {
  const maxAttempts = 50; // Prevent infinite loops
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    // Use the look-ahead assignment that ensures everyone keeps valid options
    const receiver = assignRandomSantaWithLookAhead(state, giver);
    
    if (!receiver) {
      // No valid options available at all
      const lastYearSanta = LAST_YEAR_ASSIGNMENTS[giver];
      const hasBasicOptions = state.availableReceivers.filter(p => 
        p !== giver && p !== lastYearSanta
      ).length > 0;
      
      if (hasBasicOptions) {
        return { 
          newState: state, 
          receiver: null, 
          error: `Cannot assign ${giver} - all potential assignments would block future assignments. This indicates a constraint problem that should have been prevented earlier.`
        };
      } else {
        return { 
          newState: state, 
          receiver: null, 
          error: `${giver} has no valid assignment options (would get ${lastYearSanta} again from last year).`
        };
      }
    }
    
    // Check if this assignment is invalid (shouldn't happen with proper logic, but safety check)
    if (isInvalidAssignment(giver, receiver)) {
      attempts++;
      continue; // Try again
    }
    
    // Valid assignment found
    const newState = addKnownAssignment(state, giver, receiver);
    return { newState, receiver };
  }
  
  // If we exhaust all attempts, return error
  return {
    newState: state,
    receiver: null,
    error: `Failed to generate valid assignment after ${maxAttempts} attempts. Please try again.`
  };
}

export function getAssignment(state: AppState, person: string): string | null {
  return state.assignments[person] || null;
}

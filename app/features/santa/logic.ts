// here lives the basic app logic (assignSanta, isAvailable, etc)

import { AppState } from './types';
import { LAST_YEAR_ASSIGNMENTS } from './constants';

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

// Check if current assignment state could lead to impossible situation
export function validateAssignmentPossible(
  state: AppState,
  remainingGivers: string[]
): boolean {
  // For each remaining giver, check if they have at least one valid option
  for (const giver of remainingGivers) {
    const lastYearSanta = LAST_YEAR_ASSIGNMENTS[giver];
    const validOptions = state.availableReceivers.filter(receiver => 
      receiver !== giver && receiver !== lastYearSanta
    );
    
    if (validOptions.length === 0) {
      return false; // This giver has no valid options
    }
  }
  return true;
}

// Check if making this specific assignment would cause future problems
export function wouldAssignmentCauseDeadlock(
  state: AppState,
  giver: string,
  potentialReceiver: string
): boolean {
  // Simulate the assignment
  const simulatedState = {
    ...state,
    availableReceivers: state.availableReceivers.filter(r => r !== potentialReceiver),
    assignments: { ...state.assignments, [giver]: potentialReceiver }
  };
  
  // Check remaining unassigned givers
  const remainingGivers = state.familyMembers.filter(member => 
    !simulatedState.assignments[member]
  );
  
  return !validateAssignmentPossible(simulatedState, remainingGivers);
}

// Smart assignment that avoids creating deadlocks
export function assignRandomSantaSafely(
  state: AppState,
  you: string
): string | null {
  const lastYearSanta = LAST_YEAR_ASSIGNMENTS[you];
  const basicAvailable = state.availableReceivers.filter((p) => 
    p !== you && p !== lastYearSanta
  );
  
  if (basicAvailable.length === 0) return null;
  
  // If only one option, check if it would cause problems
  if (basicAvailable.length === 1) {
    const onlyOption = basicAvailable[0];
    if (wouldAssignmentCauseDeadlock(state, you, onlyOption)) {
      return null; // This assignment would cause problems later
    }
    return onlyOption;
  }
  
  // Multiple options - filter out ones that would cause deadlocks
  const safeOptions = basicAvailable.filter(receiver => 
    !wouldAssignmentCauseDeadlock(state, you, receiver)
  );
  
  // If we have safe options, use them
  if (safeOptions.length > 0) {
    return safeOptions[Math.floor(Math.random() * safeOptions.length)];
  }
  
  // If no safe options, we have to make a choice that might cause issues
  // This should be rare with proper constraint checking
  return basicAvailable[Math.floor(Math.random() * basicAvailable.length)];
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
  // Use the safe assignment function that checks for deadlocks
  const receiver = assignRandomSantaSafely(state, giver);
  
  if (!receiver) {
    // Check if this is due to last-year constraints or just no options
    const hasAnyOptions = state.availableReceivers.filter(p => p !== giver).length > 0;
    
    if (hasAnyOptions) {
      const lastYearSanta = LAST_YEAR_ASSIGNMENTS[giver];
      const assignedCount = Object.keys(state.assignments).length;
      const totalMembers = state.familyMembers.length;
      
      if (assignedCount < totalMembers - 2) {
        // Early in the process - suggest trying different order
        return { 
          newState: state, 
          receiver: null, 
          error: `Assignment blocked: ${giver} can only get ${lastYearSanta} (same as last year), but this would cause conflicts later. Try assigning ${giver} earlier in the process, or reset and assign people in a different order.`
        };
      } else {
        // Late in the process - this is the edge case we detected
        return { 
          newState: state, 
          receiver: null, 
          error: `Assignment impossible: ${giver} would get ${lastYearSanta} again (same as last year), but this would create conflicts for remaining assignments. Please reset and try again with a different assignment order.`
        };
      }
    } else {
      return { 
        newState: state, 
        receiver: null, 
        error: 'No available people left to assign!'
      };
    }
  }
  
  const newState = addKnownAssignment(state, giver, receiver);
  return { newState, receiver };
}

export function getAssignment(state: AppState, person: string): string | null {
  return state.assignments[person] || null;
}

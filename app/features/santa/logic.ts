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
): { newState: AppState; receiver: string | null } {
  const receiver = assignRandomSanta(state.familyMembers, state.availableReceivers, giver);
  
  if (!receiver) {
    return { newState: state, receiver: null };
  }
  
  const newState = addKnownAssignment(state, giver, receiver);
  return { newState, receiver };
}

export function getAssignment(state: AppState, person: string): string | null {
  return state.assignments[person] || null;
}

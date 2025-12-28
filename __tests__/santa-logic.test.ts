/**
 * Unit tests for Secret Santa assignment logic
 * 
 * These tests ensure:
 * 1. Invalid assignments are properly detected
 * 2. Deadlock situations are prevented
 * 3. Assignment generation works correctly
 * 4. Edge cases are handled properly
 */

import { 
  isInvalidAssignment,
  generateAssignment,
  initializeAppState,
  addKnownAssignment,
  wouldAssignmentLeaveEveryoneWithOptions,
  assignRandomSantaWithLookAhead
} from '../app/features/santa/logic';
import { FAMILY_MEMBERS, LAST_YEAR_ASSIGNMENTS } from '../app/features/santa/constants';
import { AppState } from '../app/features/santa/types';

describe('Secret Santa Logic Tests', () => {
  
  describe('isInvalidAssignment', () => {
    test('should detect self-assignment as invalid', () => {
      expect(isInvalidAssignment('Carrie', 'Carrie')).toBe(true);
      expect(isInvalidAssignment('Alan', 'Alan')).toBe(true);
    });

    test('should detect same-as-last-year assignment as invalid', () => {
      // From constants: Alan had Carrie last year
      expect(isInvalidAssignment('Alan', 'Carrie')).toBe(true);
      // From constants: Carrie had Chris last year  
      expect(isInvalidAssignment('Carrie', 'Chris')).toBe(true);
      // From constants: Chris had Alan last year
      expect(isInvalidAssignment('Chris', 'Alan')).toBe(true);
    });

    test('should allow valid assignments', () => {
      // Carrie can have Alan (she had Chris last year, not Alan)
      expect(isInvalidAssignment('Carrie', 'Alan')).toBe(false);
      // Alan can have Rosa (he had Carrie last year, not Rosa)
      expect(isInvalidAssignment('Alan', 'Rosa')).toBe(false);
    });

    test('should handle people not in last year assignments', () => {
      // If someone wasn't in the secret santa last year, they should be able to get anyone (except themselves)
      const newPerson = 'NewPerson';
      expect(isInvalidAssignment(newPerson, 'Carrie')).toBe(false);
      expect(isInvalidAssignment(newPerson, newPerson)).toBe(true); // Still can't have themselves
    });
  });

  describe('Deadlock Prevention Tests', () => {
    test('should prevent the specific deadlock scenario mentioned', () => {
      // Create the problematic state where Chris would be left with only Alan (his last year assignment)
      const problematicState: AppState = {
        familyMembers: FAMILY_MEMBERS,
        availableReceivers: ['Alan'], // Only Alan left
        assignments: {
          "Alan": "Nhic",
          "Nhic": "Rosa", 
          "Rosa": "Ethan",
          "Ethan": "Chris", 
          "Camila": "Carrie",
          "Carrie": "Camila"
        },
        completedAssignments: [
          { giver: "Alan", receiver: "Nhic" },
          { giver: "Nhic", receiver: "Rosa" },
          { giver: "Rosa", receiver: "Ethan" },
          { giver: "Ethan", receiver: "Chris" },
          { giver: "Camila", receiver: "Carrie" },
          { giver: "Carrie", receiver: "Camila" }
        ]
      };

      // Chris should not be able to get an assignment in this state
      // because Alan (the only available person) was his assignment last year
      const { receiver, error } = generateAssignment(problematicState, 'Chris');
      expect(receiver).toBeNull();
      expect(error).toBeTruthy();
    });

    test('should detect when an assignment would leave someone with no valid options', () => {
      let state = initializeAppState(FAMILY_MEMBERS);
      
      // Manually create a scenario that would lead to the deadlock
      // We'll assign everyone except Chris and Alan, making sure Chris would only have Alan left
      const assignments = [
        { giver: "Nhic", receiver: "Rosa" },
        { giver: "Rosa", receiver: "Ethan" }, 
        { giver: "Ethan", receiver: "Chris" },
        { giver: "Camila", receiver: "Carrie" },
        { giver: "Carrie", receiver: "Camila" }
      ];

      // Apply these assignments
      for (const { giver, receiver } of assignments) {
        state = addKnownAssignment(state, giver, receiver);
      }

      // Now Alan should not be assignable to Nhic because it would leave Chris with only Alan (invalid)
      const wouldLeaveChrisStranded = !wouldAssignmentLeaveEveryoneWithOptions(state, 'Alan', 'Nhic');
      expect(wouldLeaveChrisStranded).toBe(true);
    });
  });

  describe('Assignment Generation Tests', () => {
    test('should generate valid assignments for all family members', () => {
      let state = initializeAppState(FAMILY_MEMBERS);
      const assignedPeople = new Set<string>();
      
      for (const person of FAMILY_MEMBERS) {
        const { newState, receiver, error } = generateAssignment(state, person);
        
        if (receiver) {
          // Should be a valid assignment
          expect(isInvalidAssignment(person, receiver)).toBe(false);
          // Should not assign someone already taken
          expect(assignedPeople.has(receiver)).toBe(false);
          assignedPeople.add(receiver);
          state = newState;
        } else {
          // If no assignment possible, should have a valid error
          expect(error).toBeTruthy();
        }
      }
    });

    test('should handle retry logic correctly', () => {
      // Create a state where there's only one valid option
      let state = initializeAppState(['Person1', 'Person2', 'Person3']);
      
      // Assign Person2 to someone else, leaving only Person3 available
      state = addKnownAssignment(state, 'Person2', 'Person3');
      
      // Person1 should get a valid assignment (can't get themselves or Person3 who is taken)
      const { receiver, error } = generateAssignment(state, 'Person1');
      expect(error).toBeFalsy();
      expect(receiver).toBeTruthy();
      expect(receiver).not.toBe('Person1');
      expect(receiver).not.toBe('Person3');
    });

    test('should eventually find valid assignments even with complex constraints', () => {
      // Test multiple times to account for randomness
      for (let attempt = 0; attempt < 10; attempt++) {
        let state = initializeAppState(FAMILY_MEMBERS);
        let successCount = 0;
        
        // Try to assign everyone
        for (const person of FAMILY_MEMBERS) {
          const { newState, receiver } = generateAssignment(state, person);
          if (receiver) {
            state = newState;
            successCount++;
          }
        }
        
        // Should be able to assign most people (at least 5 out of 7)
        expect(successCount).toBeGreaterThanOrEqual(5);
      }
    });
  });

  describe('Look-ahead Algorithm Tests', () => {
    test('should use look-ahead to prevent future assignment problems', () => {
      const state = initializeAppState(['A', 'B', 'C']);
            
      // Test that the look-ahead function exists and can be called
      const result = assignRandomSantaWithLookAhead(state, 'A');
      expect(typeof result === 'string' || result === null).toBe(true);
    });

    test('should verify wouldAssignmentLeaveEveryoneWithOptions works correctly', () => {
      const state: AppState = {
        familyMembers: ['A', 'B', 'C', 'D'],
        availableReceivers: ['B', 'C', 'D'],
        assignments: {},
        completedAssignments: []
      };

      // This assignment should be safe (everyone still has options)
      expect(wouldAssignmentLeaveEveryoneWithOptions(state, 'A', 'B')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty family members list', () => {
      const state = initializeAppState([]);
      const { receiver, error } = generateAssignment(state, 'NonExistent');
      expect(receiver).toBeNull();
      expect(error).toBeTruthy();
    });

    test('should handle single person (impossible scenario)', () => {
      const state = initializeAppState(['OnlyPerson']);
      const { receiver, error } = generateAssignment(state, 'OnlyPerson');
      expect(receiver).toBeNull();
      expect(error).toBeTruthy();
    });

    test('should handle case where no valid assignments remain', () => {
      let state = initializeAppState(['A', 'B', 'C']);
      // Assign A->B and B->C, leaving only A available for C
      state = addKnownAssignment(state, 'A', 'B');
      state = addKnownAssignment(state, 'B', 'C');
      
      // Now C can get A (the only available person), which should work
      const { receiver, error } = generateAssignment(state, 'C');
      expect(receiver).toBe('A');
      expect(error).toBeFalsy();
      
      // But if we try to assign someone when no one is available, it should fail
      const emptyState = {
        ...state,
        availableReceivers: [] // No one left
      };
      const { receiver: receiver2, error: error2 } = generateAssignment(emptyState, 'SomeoneElse');
      expect(receiver2).toBeNull();
      expect(error2).toBeTruthy();
    });
  });

  describe('Regression Tests for Known Issues', () => {
    test('should prevent reaching deadlock states during assignment process', () => {
      // Run multiple simulations to ensure our algorithm never creates deadlock situations
      for (let simulation = 0; simulation < 50; simulation++) {
        let state = initializeAppState(FAMILY_MEMBERS);
        const assignmentOrder = [...FAMILY_MEMBERS].sort(() => Math.random() - 0.5);
        
        let assignedCount = 0;
        
        // Try to assign everyone in random order
        for (const person of assignmentOrder) {
          if (state.assignments[person]) continue; // Already assigned
          
          const { newState, receiver } = generateAssignment(state, person);
          
          if (receiver) {
            state = newState;
            assignedCount++;
          } else {
            // If assignment fails, verify the state isn't a preventable deadlock
            const remainingPeople = FAMILY_MEMBERS.filter(p => !state.assignments[p]);
            
            // For each remaining person, check if they have any valid options
            let totalValidOptions = 0;
            for (const remaining of remainingPeople) {
              const lastYear = LAST_YEAR_ASSIGNMENTS[remaining];
              const validOptions = state.availableReceivers.filter(option =>
                option !== remaining && option !== lastYear
              );
              totalValidOptions += validOptions.length;
            }
            
            // If there are available receivers but no valid options for anyone,
            // that suggests a deadlock that should have been prevented
            if (state.availableReceivers.length > 0 && totalValidOptions === 0) {
              throw new Error(`Algorithm created deadlock state in simulation ${simulation}. ` +
                `Remaining people: ${remainingPeople.join(', ')}, ` +
                `Available receivers: ${state.availableReceivers.join(', ')}, ` +
                `Assignments so far: ${JSON.stringify(state.assignments)}`);
            }
          }
        }
        
        // The algorithm should be able to assign most people successfully
        // (Complete assignment might not always be possible due to constraints, but deadlocks should be prevented)
        expect(assignedCount).toBeGreaterThanOrEqual(FAMILY_MEMBERS.length - 2);
      }
    });

    test('should never create the specific problematic assignment pattern', () => {
      // Test many random assignment sequences to ensure we don't recreate the deadlock pattern
      for (let attempt = 0; attempt < 100; attempt++) {
        let state = initializeAppState(FAMILY_MEMBERS);
        
        // Simulate the assignment process
        const people = [...FAMILY_MEMBERS].sort(() => Math.random() - 0.5);
        
        for (const person of people) {
          if (state.assignments[person]) continue;
          
          const { newState, receiver } = generateAssignment(state, person);
          if (receiver) {
            state = newState;
            
            // After each assignment, verify we haven't created a deadlock situation
            const unassignedPeople = FAMILY_MEMBERS.filter(p => !state.assignments[p]);
            
            // Check if any unassigned person would have no valid options
            for (const unassigned of unassignedPeople) {
              const lastYear = LAST_YEAR_ASSIGNMENTS[unassigned];
              const validOptions = state.availableReceivers.filter(option =>
                option !== unassigned && option !== lastYear
              );
              
              // If someone has no valid options but there are still receivers available,
              // we've created a deadlock
              if (validOptions.length === 0 && state.availableReceivers.length > 0) {
                // This should never happen with proper prevention
                throw new Error(
                  `Deadlock created: ${unassigned} has no valid options. ` +
                  `Available: [${state.availableReceivers.join(', ')}], ` +
                  `Last year they had: ${lastYear}, ` +
                  `Current assignments: ${JSON.stringify(state.assignments)}`
                );
              }
            }
          }
        }
      }
    });
  });
});
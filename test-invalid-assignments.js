// Simple test to verify the invalid assignment logic works
const { isInvalidAssignment } = require('./app/features/santa/logic.ts');

// Test cases
console.log('Testing invalid assignment detection:');

// Test self-assignment
console.log('Self-assignment (Carrie -> Carrie):', isInvalidAssignment('Carrie', 'Carrie')); // Should be true

// Test last year assignment (from constants)
console.log('Last year assignment (Alan -> Carrie):', isInvalidAssignment('Alan', 'Carrie')); // Should be true (Alan had Carrie last year)
console.log('Last year assignment (Carrie -> Chris):', isInvalidAssignment('Carrie', 'Chris')); // Should be true (Carrie had Chris last year)

// Test valid assignments
console.log('Valid assignment (Carrie -> Alan):', isInvalidAssignment('Carrie', 'Alan')); // Should be false
console.log('Valid assignment (Alan -> Rosa):', isInvalidAssignment('Alan', 'Rosa')); // Should be false

console.log('\nTest completed!');
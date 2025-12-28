// Test to demonstrate the edge case where assignments can fail
const FAMILY_MEMBERS = [
  'Rosa', 'Alan', 'Nhic', 'Camila', 'Chris', 'Carrie', 'Ethan'
];

const LAST_YEAR_ASSIGNMENTS = {
  'Alan': 'Carrie',
  'Carrie': 'Chris', 
  'Chris': 'Alan',
  'Nhic': 'Ethan',
  'Rosa': 'Camila',
  'Camila': 'Nhic',
  'Ethan': 'Rosa'
};

// Simulate a problematic scenario
console.log('=== Edge Case Test ===');
console.log('Scenario: Carrie is the last person to be assigned');
console.log('Available receivers: Only Chris remains');
console.log('Problem: Carrie had Chris as Secret Santa last year!');
console.log('');

const carrie = 'Carrie';
const onlyChrisAvailable = ['Chris'];
const lastYearSanta = LAST_YEAR_ASSIGNMENTS[carrie];

console.log(`${carrie}'s last year Santa: ${lastYearSanta}`);
console.log(`Available receivers: ${onlyChrisAvailable.join(', ')}`);

const availablePool = onlyChrisAvailable.filter((p) => 
  p !== carrie && p !== lastYearSanta
);

console.log(`After filtering out self and last year's Santa: ${availablePool.join(', ') || 'NONE!'}`);
console.log(`Result: ${availablePool.length === 0 ? '❌ ASSIGNMENT FAILS!' : '✅ Assignment possible'}`);
console.log('');
console.log('This demonstrates the edge case where the constraint makes assignment impossible!');
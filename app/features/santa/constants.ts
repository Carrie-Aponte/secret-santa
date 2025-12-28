// Shared constants for the Secret Santa app

export const FAMILY_MEMBERS: string[] = [
  'Rosa', 'Alan', 'Nhic', 'Camila', 'Chris', 'Carrie', 'Ethan'
];


export const LAST_YEAR_ASSIGNMENTS: Record<string, string> = {
  'Alan': 'Carrie',
  'Carrie': 'Chris',
  'Chris': 'Alan',
  'Nhic': 'Ethan',
  'Rosa': 'Camila',
  'Camila': 'Nhic',
  'Ethan': 'Rosa'
};
// where we'll store the people who are still available to be selected as a secret santa

export type Participant = {
  name: string;
  assignedTo?: string;
  confirmed: boolean;
};

export type SantaAssignment = {
  giver: string;
  receiver: string;
};

export type AppState = {
  familyMembers: string[];
  availableReceivers: string[];
  assignments: Record<string, string>; // giver -> receiver
  completedAssignments: SantaAssignment[];
};

export type AppMode = 'home' | 'assign' | 'check';

export type AssignmentStep = 'initial' | 'knows-santa' | 'enter-santa' | 'generate-santa' | 'complete';
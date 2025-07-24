// where we'll store the people who are still available to be selected as a secret santa

export type Participant = {
  name: string;
  assignedTo?: string;
  confirmed: boolean;
};
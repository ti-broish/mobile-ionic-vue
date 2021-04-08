export interface Party {
  id: number;
  name: string;
  displayName: string;
  isFeatured: boolean;
}

export interface PartyVotes {
  index?: number|null;
  party: Party|null;
  votes: number|string|null;
}

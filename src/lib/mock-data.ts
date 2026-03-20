import { Group, Game } from './types';

export const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'The Friday Night Casters',
    userId: 'p1',
    players: [
      { id: 'p1', name: 'Alex (You)', isUser: true },
      { id: 'p2', name: 'Jordan', isUser: false },
      { id: 'p3', name: 'Sam', isUser: false },
      { id: 'p4', name: 'Riley', isUser: false },
    ]
  },
  {
    id: 'g2',
    name: 'High Power League',
    userId: 'p1',
    players: [
      { id: 'p1', name: 'Alex (You)', isUser: true },
      { id: 'p5', name: 'Casey', isUser: false },
      { id: 'p6', name: 'Quinn', isUser: false },
    ]
  }
];

export const MOCK_GAMES: Game[] = [
  {
    id: 'gm1',
    groupId: 'g1',
    date: '2024-03-01',
    winnerPlayerId: 'p1',
    participants: [
      { playerId: 'p1', commanderName: 'The Ur-Dragon', colorIdentity: 'WUBRG' },
      { playerId: 'p2', commanderName: 'Atragxa, Praetors Voice', colorIdentity: 'Witch-Maw' },
      { playerId: 'p3', commanderName: 'Krenko, Mob Boss', colorIdentity: 'Mono-R' },
      { playerId: 'p4', commanderName: 'Kenrith, the Returned King', colorIdentity: 'WUBRG' },
    ]
  },
  {
    id: 'gm2',
    groupId: 'g1',
    date: '2024-03-05',
    winnerPlayerId: 'p2',
    participants: [
      { playerId: 'p1', commanderName: 'Lathril, Blade of the Elves', colorIdentity: 'Golgari' },
      { playerId: 'p2', commanderName: 'Edgar Markov', colorIdentity: 'Mardu' },
      { playerId: 'p3', commanderName: 'Krenko, Mob Boss', colorIdentity: 'Mono-R' },
      { playerId: 'p4', commanderName: 'Wilhelt, the Rotcleaver', colorIdentity: 'Dimir' },
    ]
  },
  {
    id: 'gm3',
    groupId: 'g1',
    date: '2024-03-10',
    winnerPlayerId: 'p1',
    participants: [
      { playerId: 'p1', commanderName: 'The Ur-Dragon', colorIdentity: 'WUBRG' },
      { playerId: 'p2', commanderName: 'Edgar Markov', colorIdentity: 'Mardu' },
      { playerId: 'p3', commanderName: 'Golos, Tireless Pilgrim', colorIdentity: 'WUBRG' },
      { playerId: 'p4', commanderName: 'Wilhelt, the Rotcleaver', colorIdentity: 'Dimir' },
    ]
  }
];

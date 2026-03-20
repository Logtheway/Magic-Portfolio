
export type ColorCombination = 'Mono-W' | 'Mono-U' | 'Mono-B' | 'Mono-R' | 'Mono-G' | 'Azorius' | 'Dimir' | 'Rakdos' | 'Gruul' | 'Selesnya' | 'Orzhov' | 'Izzet' | 'Golgari' | 'Boros' | 'Simic' | 'Esper' | 'Grixis' | 'Jund' | 'Naya' | 'Bant' | 'Abzan' | 'Jeskai' | 'Sultai' | 'Mardu' | 'Temur' | 'Glint-Eye' | 'Dune-Brood' | 'Ink-Treader' | 'Witch-Maw' | 'Yore-Tiller' | 'WUBRG' | 'Colorless';

export const COLOR_OPTIONS: { name: string; value: ColorCombination }[] = [
  { name: 'Mono-White', value: 'Mono-W' },
  { name: 'Mono-Blue', value: 'Mono-U' },
  { name: 'Mono-Black', value: 'Mono-B' },
  { name: 'Mono-Red', value: 'Mono-R' },
  { name: 'Mono-Green', value: 'Mono-G' },
  { name: 'Azorius (WU)', value: 'Azorius' },
  { name: 'Dimir (UB)', value: 'Dimir' },
  { name: 'Rakdos (BR)', value: 'Rakdos' },
  { name: 'Gruul (RG)', value: 'Gruul' },
  { name: 'Selesnya (GW)', value: 'Selesnya' },
  { name: 'Orzhov (WB)', value: 'Orzhov' },
  { name: 'Izzet (UR)', value: 'Izzet' },
  { name: 'Golgari (BG)', value: 'Golgari' },
  { name: 'Boros (RW)', value: 'Boros' },
  { name: 'Simic (GU)', value: 'Simic' },
  { name: 'Esper (WUB)', value: 'Esper' },
  { name: 'Grixis (UBR)', value: 'Grixis' },
  { name: 'Jund (BRG)', value: 'Jund' },
  { name: 'Naya (RGW)', value: 'Naya' },
  { name: 'Bant (GWU)', value: 'Bant' },
  { name: 'Abzan (WBG)', value: 'Abzan' },
  { name: 'Jeskai (URW)', value: 'Jeskai' },
  { name: 'Sultai (BGU)', value: 'Sultai' },
  { name: 'Mardu (WBR)', value: 'Mardu' },
  { name: 'Temur (GUR)', value: 'Temur' },
  { name: 'Glint-Eye (UBRG)', value: 'Glint-Eye' },
  { name: 'Dune-Brood (WBRG)', value: 'Dune-Brood' },
  { name: 'Ink-Treader (WURG)', value: 'Ink-Treader' },
  { name: 'Witch-Maw (WUBG)', value: 'Witch-Maw' },
  { name: 'Yore-Tiller (WUBR)', value: 'Yore-Tiller' },
  { name: 'WUBRG', value: 'WUBRG' },
  { name: 'Colorless', value: 'Colorless' },
];

export interface Player {
  id: string;
  name: string;
  isUser: boolean;
}

export interface Group {
  id: string;
  name: string;
  players: Player[];
  ownerId: string;
  createdAt?: any;
}

export interface Game {
  id: string;
  groupId: string;
  date: string;
  winnerPlayerId: string;
  participants: {
    playerId: string;
    commanderName: string;
    colorIdentity: ColorCombination;
  }[];
  createdAt?: any;
}

export interface DeckCard {
  name: string;
  count: number;
  category: string;
}

export interface Deck {
  id: string;
  name: string;
  commander: string;
  ownerId: string;
  cards: DeckCard[];
  createdAt?: any;
}

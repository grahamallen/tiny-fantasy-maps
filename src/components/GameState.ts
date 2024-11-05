import { atom } from "jotai";
import { shuffle } from 'd3-array';

const TILE_STATUSES = ['empty', 'wizard', 'dragon', 'castle', 'tavern', 'mountain', 'river', 'wall', 'house', 'tree', 'treasure']
const PLACEMENT_RULES = ['row1', 'row2', 'row3', 'row4', 'row5', 'row6', 'row7', 'row8', 'row9', 'col1', 'col2', 'col3', 'col4', 'col5', 'col6', 'col7', 'col8', 'col9', 'NW', 'N', 'NE', "W", "C", "E", "SW", "S", "SE", "all"] 

export type TileStatus = typeof TILE_STATUSES[number]
export type PlacementRule = typeof PLACEMENT_RULES[number]
export type Coord = {
  i: number;
  j: number;
}

export type Tile = {
  status: TileStatus
}

export interface TileOption {
  id: number;
  description: String;
  rule: PlacementRule;
  isSelected: boolean;
  tile: Tile;
}

export const descriptions: Record<TileStatus, string> = {
  'dragon': "Dragons like to be near mountains and gold, and far from people",
  'mountain': "Mountains like to be near trees and rivers",
  'river': "Rivers like to make long, continuous, non-overlapping lines",
  'castle': "Castles like to have large kingdoms (far from walls, houses, or taverns)",
  'wall': "Walls like to enclose castles but not houses or taverns",
  'house': "Houses like to be near unique other tiles (including houses)",
  'tree': "Trees like to be touching other trees",
  'tavern': "Taverns like to be the only tavern near a given group of houses",
  'treasure': "Treasure likes to be near treasure and far from the center of the map",
  'wizard': "Wizards like to be far from houses and taverns",
}

export const scores: Record<TileStatus, string> = {
  'dragon': "2pts per nearby mountain/gold, 1pt per square away from nearest house/tavern/castle/wizard",
  'mountain': "2pts per nearby tree/river",
  'river': "2pts per river along a nearby continous line -2pts (river alone gets 0)",
  'castle': "1pt per square away from closest wall/house/tavern",
  'wall': "10pts for enclosing a castle, -2 for each enclosed house/tavern",
  'house': "1pt per unique tile nearby",
  'tree': "2pts per tree in an adjacent group -2pts (tree alone gets 0)",
  'tavern': "2pts per house near tavern, 0 if house already has a tavern",
  'treasure': "1pt per treasure + 1pt per square away from center",
  'wizard': "2pt per square away from nearest house/tavern"
}

const placementDeck: PlacementRule[] = shuffle(PLACEMENT_RULES.slice(0, 27).concat(PLACEMENT_RULES.slice(0, 27)))
const tileDeck: TileStatus[] = shuffle(TILE_STATUSES.slice(1).concat(TILE_STATUSES.slice(2), TILE_STATUSES.slice(4), TILE_STATUSES.slice(4), TILE_STATUSES.slice(4), TILE_STATUSES.slice(4), TILE_STATUSES.slice(4))) //10 + 9 + 7 + 7 + 7 + 7 + 7

const getTileDeck = (i: number = 0): TileOption[] => {
  const toHash = (tileStatus: TileStatus, rule: PlacementRule) => {
    return `${tileStatus},${rule}`
  }
  
  const tileDeckCopy: TileStatus[] = tileDeck.slice()
  const placementDeckCopy: PlacementRule[] = placementDeck.slice()

  // To prevent duplicate cards from ever being presented as options, we keep track of which ones have been created this time
  // and make sure not to create the same one twice.
  const existingCards = new Set<String>()
  const resp: TileOption[] = []
  let j = 0;
  while (tileDeckCopy.length > 0) {
    if (j > 1000) {
      if (i > 9) {
        console.error("bad loop")
        break;
      } else {
        return getTileDeck(i + 1)
      }
    }

    const tileStatus = tileDeckCopy.pop()
    const rule = placementDeckCopy.pop()

    if (tileStatus === undefined || rule === undefined) {
      console.error(["whoops", tileStatus, rule])
      break
    }

    if (existingCards.has(toHash(tileStatus, rule))) {
      //Try again with a different rule or tilestatus
      if (j % 2 === 0) {
        tileDeckCopy.unshift(tileStatus)
        placementDeckCopy.push(rule)
      } else {
        tileDeckCopy.push(tileStatus)
        placementDeckCopy.unshift(rule)
      }

      j++

      continue
    }

    existingCards.add(toHash(tileStatus, rule))
    resp.push({
      description: descriptions[tileStatus],
      id: j,
      isSelected: false,
      rule: placementDeck[j],
      tile: {
        status: tileStatus
      } 
    })
    j++
  }

  return resp
}

const deckOfCards: TileOption[] = getTileDeck()
export const deckOfCardsAtom = atom<TileOption[]>(deckOfCards)

export const roundsRemainingAtom = atom<number>(3)
export const turnsRemainingAtom = atom<number>(9)

export const nextOptionsAtom = atom<TileOption[]>((get) => get(deckOfCardsAtom).slice(0, 2))
export const chosenOptionAtom = atom<TileOption | null>((get) => get(nextOptionsAtom).find(option => option.isSelected) ?? null)

export const getArtForTile = (tileStatus: TileStatus) => {
  switch (tileStatus) {
    case 'empty':
      return ''
    case 'dragon':
      return '🐲'
    case 'mountain':
      return '🗻'
    case 'river':
      return '💦'
    case 'castle':
      return '🏰'
    case 'wall':
      return '🧱'
    case 'house':
      return '🏠'
    case 'tree':
      return '🌲'
    case 'tavern':
      return '🌆'
    case 'treasure':
      return '💰'
    case 'wizard':
      return '🧙‍♂️'
  }
}

export const tilesAtom = atom<Tile[][]>([
  [
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    }
  ],
  [
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    }
  ],
  [
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    }
  ],
  [
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    }
  ],
  [
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    }
  ],
  [
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    }
  ],
  [
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    }
  ],
  [
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    }
  ],
  [
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    },
    {
      "status": 'empty',
    }
  ]
])
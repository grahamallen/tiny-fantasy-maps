import { atom } from "jotai";
import { shuffle } from 'd3-array';

const TILE_STATUSES = ['empty', 'wizard', 'dragon', 'castle', 'tavern', 'mountain', 'river', 'wall', 'house', 'tree', 'treasure']
const PLACEMENT_RULES = ['row1', 'row2', 'row3', 'row4', 'row5', 'row6', 'row7', 'row8', 'row9', 'col1', 'col2', 'col3', 'col4', 'col5', 'col6', 'col7', 'col8', 'col9', 'NW', 'N', 'NE', "W", "C", "E", "SW", "S", "SE", "all"] 

export type TileStatus = typeof TILE_STATUSES[number]
export type PlacementRule = typeof PLACEMENT_RULES[number]

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
  'dragon': "Dragons like to be near mountains and gold, and are angered by people",
  'mountain': "Mountains like to be near other mountains and trees",
  'river': "Rivers like to make long, non-overlapping lines",
  'castle': "Castles like to be near gold and far from dragons",
  'wall': "Walls like to surround castles but not houses",
  'house': "Houses like to be near unique other tiles (including houses)",
  'tree': "Trees like to make large contiguous groups",
  'tavern': "Taverns like to be near houses, but do not like to share",
  'treasure': "Treasure likes to be far from the center of the map",
  'wizard': "Wizards like to be far from houses and taverns"
}

const placementDeck: PlacementRule[] = shuffle(PLACEMENT_RULES.slice(0, 27).concat(PLACEMENT_RULES.slice(0, 27)))
const tileDeck: TileStatus[] = shuffle(TILE_STATUSES.slice(1).concat(TILE_STATUSES.slice(2), TILE_STATUSES.slice(4), TILE_STATUSES.slice(4), TILE_STATUSES.slice(4), TILE_STATUSES.slice(4), TILE_STATUSES.slice(4))) //10 + 9 + 7 + 7 + 7 + 7 + 7
const deckOfCards: TileOption[] = tileDeck.map((tileStatus: TileStatus, i: number) => {
  return {
    description: descriptions[tileStatus],
    id: i,
    isSelected: false,
    rule: placementDeck[i],
    tile: {
      status: tileStatus
    } 
  }
})

export const deckOfCardsAtom = atom<TileOption[]>(deckOfCards)

export const roundsRemianingAtom = atom<number>(3)
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

export const getScore = (tile: TileStatus, tiles: Tile[][]): number => {
  return 0
}


export const getPlacementRuleMatrix = (rule: PlacementRule): Boolean[][] => {
  if (rule.startsWith("row")) {
    const rowNum = parseInt(rule[rule.length - 1])
    return Array.from({length: 9}).map((_, row_i) => {
      return Array.from({length: 9}).map((_) => {
        if (row_i === rowNum - 1) {
          return true
        }

        return false
      })
    })
  } else if (rule.startsWith("col")) {
    const colNum = parseInt(rule[rule.length - 1])
    return Array.from({length: 9}).map((_) => {
      return Array.from({length: 9}).map((_, col_i) => {
        if (col_i === colNum - 1) {
          return true
        }

        return false
      })
    })
  } else {
    switch(rule) {
      case "NW":
        return Array.from({length: 9}).map((_, row_i) => {
          return Array.from({length: 9}).map((_, col_i) => {
            if (col_i < 3 && row_i < 3) {
              return true
            }
    
            return false
          })
        })
      case "N":
        return Array.from({length: 9}).map((_, row_i) => {
          return Array.from({length: 9}).map((_, col_i) => {
            if (col_i >= 3 && col_i < 6 && row_i < 3) {
              return true
            }
    
            return false
          })
        })
      case "NE":
        return Array.from({length: 9}).map((_, row_i) => {
          return Array.from({length: 9}).map((_, col_i) => {
            if (col_i >= 6 && row_i < 3) {
              return true
            }
    
            return false
          })
        })
      case "W":
        return Array.from({length: 9}).map((_, row_i) => {
          return Array.from({length: 9}).map((_, col_i) => {
            if (col_i < 3 && row_i >= 3 && row_i < 6) {
              return true
            }
    
            return false
          })
        })
      case "C":
        return Array.from({length: 9}).map((_, row_i) => {
          return Array.from({length: 9}).map((_, col_i) => {
            if (col_i >= 3 && col_i < 6 && row_i >= 3 && row_i < 6) {
              return true
            }
    
            return false
          })
        })
      case "E":
        return Array.from({length: 9}).map((_, row_i) => {
          return Array.from({length: 9}).map((_, col_i) => {
            if (col_i >= 6 && row_i >= 3 && row_i < 6) {
              return true
            }
    
            return false
          })
        })
      case "SW":
        return Array.from({length: 9}).map((_, row_i) => {
          return Array.from({length: 9}).map((_, col_i) => {
            if (col_i < 3 && row_i >= 6) {
              return true
            }
    
            return false
          })
        })
      case "S":
        return Array.from({length: 9}).map((_, row_i) => {
          return Array.from({length: 9}).map((_, col_i) => {
            if (col_i >= 3 && col_i < 6 && row_i >= 6) {
              return true
            }
    
            return false
          })
        })
      case "SE":
        return Array.from({length: 9}).map((_, row_i) => {
          return Array.from({length: 9}).map((_, col_i) => {
            if (col_i >= 6 && row_i >= 6) {
              return true
            }
    
            return false
          })
        })
      default:
        return Array.from({length: 9}).map((_, row_i) => {
          return Array.from({length: 9}).map((_, col_i) => {
            return true
          })
        })
    }
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
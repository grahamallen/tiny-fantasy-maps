import { atom } from "jotai";
import { shuffle } from 'd3-array';
import { sortWallCoords } from "../utils/tiles.ts";

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
  'river': "Rivers like to make long, continuous, diagonally-nearby lines",
  'castle': "Castles like to have large kingdoms (far from walls, houses, or taverns)",
  'wall': "Walls like to enclose castles but not houses or taverns",
  'house': "Houses like to be near unique other tiles (including houses)",
  'tree': "Trees like to be touching other trees",
  'tavern': "Taverns like to be the only tavern near a given group of houses",
  'treasure': "Treasure likes to be far from the center of the map",
  'wizard': "Wizards like to be far from houses and taverns",
}

export const scores: Record<TileStatus, string> = {
  'dragon': "2pts per nearby mountain/gold, 1pt per square away from nearest house/tavern/castle/wizard",
  'treasure': "1pt for every 2 squares away from center per treasure",
  'mountain': "2pts per nearby tree/river",
  'river': "3pts per river along a diagonally-nearby continous line -3pts (river alone gets 0)",
  'tree': "2pts per tree in an adjacent group -2pts (tree alone gets 0)",
  'wall': "10pts for enclosing a castle, -2pts for each enclosed house/tavern",
  'castle': "1pt per square away from closest wall/house/tavern",
  'house': "1pt per unique tile nearby",
  'tavern': "2pts per house near tavern, 0 if house already has a tavern",
  'wizard': "2pts per square away from nearest house/tavern"
}

const placementDeckCut: number = Math.ceil(Math.random() * 26) // Cut the deck between 1/27 and 26/27 of the way through
const placementDeck: PlacementRule[] = PLACEMENT_RULES.slice(placementDeckCut, 27).concat(
  PLACEMENT_RULES.slice(0, 27),
  PLACEMENT_RULES.slice(0, placementDeckCut) // Put the remaining cards from the cut at the bottom
)
const tileDeck: TileStatus[] = TILE_STATUSES.slice(1).concat(
  TILE_STATUSES.slice(2), 
  TILE_STATUSES.slice(4), 
  TILE_STATUSES.slice(4), 
  TILE_STATUSES.slice(4), 
  TILE_STATUSES.slice(4), 
  TILE_STATUSES.slice(4)
).sort() //10 + 9 + 7 + 7 + 7 + 7 + 7 = 54 with exactly 1 wizard, 2 dragons, and 2 castles

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

  return shuffle(resp)
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


const emptyMap: Tile[][] = Array.from({length: 9}).map((row) => Array.from({length: 9}).map((col) => ({
  "status": 'empty',
})))
export const tilesAtom = atom<Tile[][]>(emptyMap)

export const wallsAtom = atom<Coord[]>((get) => {
  const tiles = get(tilesAtom)
  const wallCoords: Coord[] = []
  tiles.forEach((row, i) => row.forEach((tile, j) => tile.status === 'wall' ? wallCoords.push({i, j}) : null))
  
  if (wallCoords.length < 2) {
    return wallCoords
  }

  const canvas: OffscreenCanvas = new OffscreenCanvas(9,9)
  const context = canvas.getContext('2d')
  if (context == null) {
    return wallCoords
  }

  context.fillStyle = "#FFF"
  context.strokeStyle = "#000"
  wallCoords.sort(sortWallCoords(wallCoords))
  wallCoords.forEach((wallCoord, i) => {
    if (i === 0) {
      context.beginPath()
      context.moveTo(wallCoord.i, wallCoord.j)
    }

    context.lineTo(wallCoord.i, wallCoord.j)
  })
  context.closePath()

  const interiorCoords: Coord[] = []
  tiles.forEach((row, i) => 
    row.forEach((tile, j) => 
      context.isPointInPath(i, j) ? interiorCoords.push({i,j}) : context.isPointInStroke(i,j) ? interiorCoords.push({i,j}) : null
    )
  )

  return interiorCoords
})
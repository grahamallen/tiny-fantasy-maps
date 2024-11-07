import { Coord, Tile, TileStatus } from "../components/GameState"
import { systemicDifference } from "./set.ts"
import { getClosestTileOfTypes, getTileBlob, getCoordsNear, toHash, getDiagonallyNearbyTileBlob, sortWallCoords } from "./tiles.ts"

export const getScore = (tileStatus: TileStatus, tiles: Tile[][]): number => {
  let matchingTileCoords: Coord[] = []
  tiles.forEach((row, i) => row.forEach((tile, j) => tile.status === tileStatus ? matchingTileCoords.push({ i, j } as Coord) : null))
  switch (tileStatus) {
    case 'dragon':
      return getDragonScore(tiles, matchingTileCoords)
    case 'treasure':
      return getTreasureScore(tiles, matchingTileCoords)
    case 'mountain':
      return getMountainScore(tiles, matchingTileCoords)
    case 'river':
      return getRiverScore(tiles, matchingTileCoords)
    case 'tree':
      return getTreeScore(tiles, matchingTileCoords)
    case 'wall':
      // TODO: handle grid position in shape algorithm
      return getWallScore(tiles, matchingTileCoords)
    case 'castle':
      return getCastleScore(tiles, matchingTileCoords)
    case 'house':
      return getHouseScore(tiles, matchingTileCoords)
    case 'tavern':
      return getTavernScore(tiles, matchingTileCoords)
    case 'wizard':
      return getWizardScore(tiles, matchingTileCoords)
    default:
      return 0
  }
}
  
const getDragonScore = (tiles: Tile[][], matchingTileCoords: Coord[]): number => {
  const goodTiles = new Set<TileStatus>(['mountain', 'treasure'])
  
  return matchingTileCoords.map((coord) => {
    const goodTilesScore = getCoordsNear(coord).map((coord: Coord): number => {
      if (goodTiles.has(tiles[coord.i][coord.j].status)) {
        return 2
      } else {
        return 0
      }
    }).reduce((acc: number, cur: number): number => acc + cur, 0)
    
    const badTilesDistance = getClosestTileOfTypes(tiles, coord, new Set<TileStatus>(['house', 'tavern', 'castle', 'wizard']))
    
    return goodTilesScore + badTilesDistance
  }).reduce((acc: number, cur: number): number => acc + cur, 0)
}

const getTreasureScore = (_: Tile[][], matchingTileCoords: Coord[]): number => {
  return matchingTileCoords.map((coord) => {
    return Math.ceil((Math.abs(coord.i - 4) + Math.abs(coord.j - 4)) / 2)
  }).reduce((acc: number, cur: number): number => acc + cur, 0)
}

const getMountainScore = (tiles: Tile[][], matchingTileCoords: Coord[]): number => {
  const goodTiles = new Set<TileStatus>(['tree', 'river'])

  return matchingTileCoords.map((coord) => {
    return getCoordsNear(coord).map((coord: Coord): number => {
      if (goodTiles.has(tiles[coord.i][coord.j].status)) {
        return 2
      } else {
        return 0
      }
    }).reduce((acc: number, cur: number): number => acc + cur, 0)
  }).reduce((acc: number, cur: number): number => acc + cur, 0)
}

const getRiverScore = (tiles: Tile[][], matchingTileCoords: Coord[]): number => {
  const rivers: Set<String>[] = []
  matchingTileCoords.forEach((coord) => {
    if (rivers.some((r) => r.has(toHash(coord)))) {
      // already counted this coord in a blob
      return
    } else {
      const river = getDiagonallyNearbyTileBlob(tiles, coord)
      rivers.push(river)
    }
  })
  
  return rivers.reduce((acc: number, cur: Set<String>): number => acc + (cur.size * 3) - 3, 0)
}

const getTreeScore = (tiles: Tile[][], matchingTileCoords: Coord[]): number => {
  const treeBlobs: Set<String>[] = []
  matchingTileCoords.forEach((coord) => {
    if (treeBlobs.some((tB) => tB.has(toHash(coord)))) {
      // already counted this coord in a blob
      return
    } else {
      const treeBlob = getTileBlob(tiles, coord)
      treeBlobs.push(treeBlob)
    }
  })
  return treeBlobs.reduce((acc: number, cur: Set<String>): number => acc + (cur.size * 2) - 2, 0)
}

const getWallScore = (tiles: Tile[][], matchingTileCoords: Coord[]): number => {
  const canvas: OffscreenCanvas = new OffscreenCanvas(9,9)
  const context = canvas.getContext('2d')
  if (context == null) {
    return 0
  }

  context.fillStyle = "#FFF"
  context.strokeStyle = "#000"
  matchingTileCoords.sort(sortWallCoords).forEach((wallCoord, i) => {
    if (i === 0) {
      context.beginPath()
    }

    context.lineTo(wallCoord.i, wallCoord.j)
  })
  context.closePath()

  const goodTileTypes = new Set(['castle'])
  const badTileTypes = new Set(['house', 'tavern'])
  let matchingGoodTileCoords: Coord[] = []
  let matchingBadTileCoords: Coord[] = []
  tiles.forEach((row, i) => 
    row.forEach((tile, j) => 
      goodTileTypes.has(tile.status) ? 
        matchingGoodTileCoords.push({ i, j } as Coord) : 
        badTileTypes.has(tile.status) ? 
          matchingBadTileCoords.push({ i, j} as Coord) : 
            null
    )
  )

  let resp: number = 0
  matchingBadTileCoords.forEach(({i: row, j: col}) => {
    // Because context has its own XY coord system, we may need to map rows and cols to it appropriately
    if (context.isPointInStroke(row, col)) {
      console.log(row, col)
      resp -= 2
    }
  })

  let alreadyFoundGoodTile = false
  matchingGoodTileCoords.forEach(({i: row, j: col}) => {
    // Because context has its own XY coord system, we may need to map rows and cols to it appropriately
    if (context.isPointInStroke(row, col) && !alreadyFoundGoodTile) {
      alreadyFoundGoodTile = true
      resp += 10
    }
  })

  return resp
}

const getCastleScore = (tiles: Tile[][], matchingTileCoords: Coord[]): number => {
  return matchingTileCoords.map((coord) => {
    return getClosestTileOfTypes(tiles, coord, new Set<TileStatus>(['house', 'tavern', 'wall']))
  }).reduce((acc: number, cur: number): number => acc + cur, 0)
}

const getHouseScore = (tiles: Tile[][], matchingTileCoords: Coord[]): number => {
  return matchingTileCoords.map((coord) => {
    const tilesNearHouse = new Set<TileStatus>(['empty'])
    return getCoordsNear(coord).map((coord: Coord): number => {
      if (tilesNearHouse.has(tiles[coord.i][coord.j].status)) {
        return 0
      } else {
        tilesNearHouse.add(tiles[coord.i][coord.j].status)
        return 1
      }
    }).reduce((acc: number, cur: number): number => acc + cur, 0)
  }).reduce((acc: number, cur: number): number => acc + cur, 0)
}

const getTavernScore = (tiles: Tile[][], matchingTileCoords: Coord[]): number => {
  const goodTiles = new Set<TileStatus>(['house'])
  const tavernHouses: Set<String>[] = matchingTileCoords.map((coord) => {
    return new Set(getCoordsNear(coord).filter(
      ({i, j}: Coord) => goodTiles.has(tiles[i][j].status)
    ).map(
      (coord: Coord) => toHash(coord)
    ))
  })
  
  return tavernHouses.reduce((acc: Set<String>, cur: Set<String>): Set<String> => systemicDifference(acc, cur), new Set([])).size * 2
}


const getWizardScore = (tiles: Tile[][], matchingTileCoords: Coord[]): number => {
  const badTiles = new Set<TileStatus>(['house', 'tavern'])

  return matchingTileCoords.map((coord) => {
    return 2 * getClosestTileOfTypes(tiles, coord, badTiles)
  }).reduce((acc: number, cur: number): number => acc + cur, 0)
}
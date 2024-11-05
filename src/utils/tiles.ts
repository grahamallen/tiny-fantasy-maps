import { Coord, PlacementRule, Tile, TileStatus } from "../components/GameState.ts"

export const toHash = (coord: Coord): String => {
  return `${coord.i},${coord.j}`
}

export const getCoordsNear = ({i, j}: Coord, includeDiagonals: Boolean = true): Coord[] => {
  let resp: Coord[] = []
  
  if (i > 0) {
    if (j > 0 && includeDiagonals) {
      resp.push({i: i - 1, j: j - 1})
    }

    resp.push({i: i - 1, j: j})

    if (j < 8 && includeDiagonals) {
      resp.push({i: i - 1, j: j + 1})
    }
  }

  if (j > 0 && includeDiagonals) {
    resp.push({i: i, j: j - 1})
  }

  if (j < 8 && includeDiagonals) {
    resp.push({i: i, j: j + 1})
  }

  if (i < 8 && includeDiagonals) {
    if (j > 0) {
      resp.push({i: i + 1, j: j - 1})
    }

    resp.push({i: i + 1, j: j})

    if (j < 8 && includeDiagonals) {
      resp.push({i: i + 1, j: j + 1})
    }
  }

  return resp
}

export const getClosestTileOfTypes = (tiles: Tile[][], coord: Coord, types: Set<TileStatus>) => {
  let min = 0;
  for (let i = 9 * 2 - 1; i >= 0; i--) {
    const tilesAtDistance = getCoordsByManhattanDistance(tiles, i, coord).map(({i, j}) => tiles[i][j])
    const containsType = tilesAtDistance.find((tile) => types.has(tile.status))
    if (containsType) {
      min = i
    }
  }
  return min
}

export const getFurthestTileOfTypes = (tiles: Tile[][], coord: Coord, types: Set<TileStatus>) => {
  let max = 0;
  for (let i = 0; i < 9 * 2; i++) {
    const tilesAtDistance = getCoordsByManhattanDistance(tiles, i, coord).map(({i, j}) => tiles[i][j])
    const containsType = tilesAtDistance.find((tile) => types.has(tile.status))
    if (containsType) {
      max = i
    }
  }
  return max
}

const getCoordsByManhattanDistance = (tiles: Tile[][], distance: number, coord: Coord): Coord[] => {
  if (distance === 1) {
    return getCoordsNear(coord, false)
  }
  
  let foundTiles: Coord[] = [];
  tiles.forEach((row, i) => row.forEach((_, j) => {
    if (Math.abs(coord.i - i) + Math.abs(coord.j - j) === distance) {
      foundTiles.push({i, j})
    }
  }))
  return foundTiles
}

export const getLongestPath = (hashes: Set<String>): number => {
  if (hashes.size < 4) {
    return hashes.size
  }

  //TODO: Handle T/Y shape



  //TODO: Handle S shape

  return 0
}

export const getNearbyTileBlob = (tiles: Tile[][], coord: Coord): Set<String> => {
  const tile = tiles[coord.i][coord.j]
  const nearbyCoords = getCoordsNear(coord)
  const coordsSet = new Set<String>([toHash(coord)])
  while (nearbyCoords.length > 0) {
    const nearbyCoord = nearbyCoords.pop()
    if (nearbyCoord == null) {
      continue
    }

    if (coordsSet.has(toHash(nearbyCoord))) {
      continue
    }

    const { i, j } = nearbyCoord
    const t = tiles[i][j]
    if (t.status === tile.status) {
      coordsSet.add(toHash(nearbyCoord))
      nearbyCoords.push(...getCoordsNear(nearbyCoord))
    }
  }
  return coordsSet
}

export const getTileBlob = (tiles: Tile[][], coord: Coord): Set<String> => {
  const tile = tiles[coord.i][coord.j]
  const adjacentCoords = getCoordsByManhattanDistance(tiles, 1, coord)
  const coordsSet = new Set<String>([toHash(coord)])
  while (adjacentCoords.length > 0) {
    const adjacentCoord = adjacentCoords.pop()
    if (adjacentCoord == null) {
      continue
    }

    if (coordsSet.has(toHash(adjacentCoord))) {
      continue
    }
    
    const { i, j } = adjacentCoord
    const t = tiles[i][j]
    if (t.status === tile.status) {
      coordsSet.add(toHash(adjacentCoord))
      adjacentCoords.push(...getCoordsByManhattanDistance(tiles, 1, adjacentCoord))
    }
  }
  return coordsSet
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
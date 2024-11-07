import { Coord, PlacementRule, Tile, TileStatus } from "../components/GameState.ts"

export const toHash = (coord: Coord): String => {
  return `${coord.i},${coord.j}`
}

export const getCoordsNear = ({i, j}: Coord, includeDiagonals: Boolean = true, includeOnlyDiagonals: Boolean = false): Coord[] => {
  let resp: Coord[] = []
  
  if (i > 0) {
    if (j > 0 && includeDiagonals) {
      resp.push({i: i - 1, j: j - 1})
    }

    if (!includeOnlyDiagonals) { 
      resp.push({i: i - 1, j: j})
    }

    if (j < 8 && includeDiagonals) {
      resp.push({i: i - 1, j: j + 1})
    }
  }

  if (j > 0 && !includeOnlyDiagonals) {
    resp.push({i: i, j: j - 1})
  }

  if (j < 8 && !includeOnlyDiagonals) {
    resp.push({i: i, j: j + 1})
  }

  if (i < 8 && includeDiagonals) {
    if (j > 0) {
      resp.push({i: i + 1, j: j - 1})
    }

    if (!includeOnlyDiagonals) {
      resp.push({i: i + 1, j: j})
    }

    if (j < 8 && includeDiagonals) {
      resp.push({i: i + 1, j: j + 1})
    }
  }

  return resp
}

export const getClosestTileOfTypes = (tiles: Tile[][], coord: Coord, types: Set<TileStatus>) => {
  let min = 0;
  for (let i = 1; i < 9 * 2; i++) {
    const tilesAtDistance = getCoordsByManhattanDistance(tiles, i, coord).map(({i, j}) => tiles[i][j])
    const containsType = tilesAtDistance.find((tile) => types.has(tile.status))
    if (containsType) {
      min = i
      break;
    }
  }
  return min
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

export const getDiagonallyNearbyTileBlob = (tiles: Tile[][], coord: Coord): Set<String> => {
  const tile = tiles[coord.i][coord.j]
  const nearbyCoords = getCoordsNear(coord, true, true)
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
      nearbyCoords.push(...getCoordsNear(nearbyCoord, true, true))
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


// Ok, it's gnarly-looking, I'm sure, but this lookup table allows us to convert the 9x9 cartesian grid into 
// an ordering of points that's roughly equivalent to a pixelated version of polar coordinates, rotated so the origin
// is at 12 o'clock (or North). Hash key coordinate values that are "more clock-wise" around the circle will have higher
// numbers associated with them, so while the lowest numbers are vertically from the center 4,4 to 4,0, the highest are just
// counter-clockwise of that at 3,0 to 3,4, and half-way through is roughly 4,5 to 4,8 as might be expected.
// Trust me that this was easier than trying to convert our "row/col" notation to "x/y" to "r/θ" notation while avoiding
// float rounding idiosyncracies.
const lookup_table: Record<string, number> = {
  "0,0": 75,
  "1,0": 76,
  "2,0": 78,
  "3,0": 81,
  "4,0": 5,
  "5,0": 6,
  "6,0": 9,
  "7,0": 12,
  "8,0": 15,
  "0,1": 72,
  "1,1": 74,
  "2,1": 77,
  "3,1": 80,
  "4,1": 4,
  "5,1": 7,
  "6,1": 11,
  "7,1": 14,
  "8,1": 16,
  "0,2": 69,
  "1,2": 71,
  "2,2": 73,
  "3,2": 79,
  "4,2": 3,
  "5,2": 8,
  "6,2": 13,
  "7,2": 17,
  "8,2": 18,
  "0,3": 66,
  "1,3": 67,
  "2,3": 68,
  "3,3": 70,
  "4,3": 2,
  "5,3": 10,
  "6,3": 19,
  "7,3": 20,
  "8,3": 21,
  "0,4": 65,
  "1,4": 64,
  "2,4": 63,
  "3,4": 62,
  "4,4": 1,
  "5,4": 22,
  "6,4": 23,
  "7,4": 24,
  "8,4": 25,
  "0,5": 61,
  "1,5": 60,
  "2,5": 59,
  "3,5": 50,
  "4,5": 42,
  "5,5": 30,
  "6,5": 28,
  "7,5": 27,
  "8,5": 26,
  "0,6": 58,
  "1,6": 57,
  "2,6": 53,
  "3,6": 48,
  "4,6": 43,
  "5,6": 39,
  "6,6": 33,
  "7,6": 31,
  "8,6": 29,
  "0,7": 56,
  "1,7": 54,
  "2,7": 51,
  "3,7": 47,
  "4,7": 44,
  "5,7": 40,
  "6,7": 37,
  "7,7": 34,
  "8,7": 32,
  "0,8": 55,
  "1,8": 52,
  "2,8": 49,
  "3,8": 46,
  "4,8": 45,
  "5,8": 41,
  "6,8": 38,
  "7,8": 36,
  "8,8": 35,
}

const lookup = (coord: Coord): number => {
  return (lookup_table[toHash(coord).toString()])
}

const getMedian = (arr: number[]): number => {
  const a = arr.slice().sort()
  while (a.length > 2) {
    a.pop()
    a.shift()
  }

  if (a.length === 2) {
    return Math.floor((a[0] + a[1]) / 2)
  }
  return a[0]
}

const transform = (coord: Coord, median: Coord): Coord => {
  return {
    i: Math.min(Math.max(coord.i - median.i + 4, 0), 8),
    j: Math.min(Math.max(coord.j - median.j + 4, 0), 8)
  }
}

export const sortWallCoords = (wallCoords: Coord[]): (a: Coord, b: Coord) => number => {
  // Normally, our lookup table assumes the points are distributed around 4,4 as the "origin" of the polar coordinate system
  // and tries to order them clockwise around that origin.

  // But if a set of walls is like this X.X......
  // then we don't have a way of making .........
  // sure that the points are in the    X.X......
  // right order unless we shift those  .........
  // points to be around the "origin"   .........
  // of our lookup table, which is at   .........
  // {4,4}. To get there, we can take   .........
  // the median of all the points and   .........
  // make that our "origin" instead.    .........

  // This can be done by i_original - i_median + 4, but that can wind up outside of the bounds of the grid for points in the NW
  // so we can ensure that it doesn't go off the grid by just using 0 as the lowest and 8 as the highest i or j value
  const median: Coord = {
    i: getMedian(wallCoords.map(w => w.i)),
    j: getMedian(wallCoords.map(w => w.j))
  }

  return (a: Coord, b: Coord): number => { 
    const transformed_a = transform(a, median)
    const transformed_b = transform(b, median)

    const lookup_a = lookup(transformed_a)
    const lookup_b = lookup(transformed_b)
    
    return lookup_a < lookup_b ? -1 : 1
  }
}
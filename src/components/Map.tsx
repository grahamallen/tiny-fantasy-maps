import { useAtom, useSetAtom } from "jotai"
import { tilesAtom, Tile, chosenOptionAtom, getPlacementRuleMatrix, getArtForTile, deckOfCardsAtom, turnsRemainingAtom, roundsRemianingAtom } from "./GameState.ts"
import React, { useCallback } from "react";
import './Map.css';
import classNames from "classnames";

export const Map = () => {
  const [tiles, setTiles] = useAtom(tilesAtom)
  const [chosenOption] = useAtom(chosenOptionAtom)
  const setDeckOfCards = useSetAtom(deckOfCardsAtom)
  const setTurnsRemaining = useSetAtom(turnsRemainingAtom)
  const setRoundsRemaining = useSetAtom(roundsRemianingAtom)
  const ruleMatrix = getPlacementRuleMatrix(chosenOption?.rule || "all")
  const isDisabled = (row: number, col: number): boolean => {
    return chosenOption === null || !ruleMatrix[row][col]
  }

  const handleTilePlacement = useCallback((row_i: number, col_i: number) => {
    if (chosenOption != null) {
      setTiles(prev => prev.map((row, i) => row.map((tile, j) => i === row_i && j === col_i ? {
        status: chosenOption.tile.status
      } as Tile : tile)))

      setDeckOfCards(prev => prev.slice(2))
      setTurnsRemaining(prev => {
        if (prev - 1 === 0) {
          setRoundsRemaining(prevRound => prevRound - 1)
          return 9
        }
        return prev - 1
      })
    }
  }, [chosenOption, setTiles, setDeckOfCards, setTurnsRemaining, setRoundsRemaining])

  return (
    <div className="map_container">
      {tiles.map((row: Tile[], row_i: number) => {
        return (
          <div className="map_row" key={`${row_i}`}>
            {row.map((tile: Tile, col_i: number) => {
              return (
                <button 
                  className={classNames("tile", { "highlighted_tile": !isDisabled(row_i, col_i) })}
                  disabled={isDisabled(row_i, col_i)} 
                  key={`${row_i}_${col_i}`}
                  onClick={() => handleTilePlacement(row_i, col_i)}
                  >
                  <span>
                    {getArtForTile(tile.status)}
                  </span>
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
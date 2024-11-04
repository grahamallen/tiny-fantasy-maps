import { useAtom, useSetAtom } from "jotai"
import { tilesAtom, Tile, chosenOptionAtom, getPlacementRuleMatrix, getArtForTile, deckOfCardsAtom, turnsRemainingAtom, roundsRemainingAtom } from "./GameState.ts"
import React, { useCallback, useRef } from "react";
import './Map.css';
import classNames from "classnames";
import { toBlob } from "html-to-image";

export const Map = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [tiles, setTiles] = useAtom(tilesAtom)
  const [chosenOption] = useAtom(chosenOptionAtom)
  const setTurnsRemaining = useSetAtom(turnsRemainingAtom)
  const [roundsRemaining, setRoundsRemaining] = useAtom(roundsRemainingAtom)
  const setDeckOfCards = useSetAtom(deckOfCardsAtom)
  const ruleMatrix = getPlacementRuleMatrix(chosenOption?.rule || "all")
  const isDisabled = (row: number, col: number): boolean => {
    return chosenOption === null || !ruleMatrix[row][col] || tiles[row][col].status !== 'empty'
  }

  const handleTilePlacement = useCallback((row_i: number, col_i: number) => {
    if (chosenOption != null && tiles[row_i][col_i].status === 'empty') {
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
  }, [tiles, chosenOption, setTiles, setDeckOfCards, setTurnsRemaining, setRoundsRemaining])

  const showCopyButton = roundsRemaining === 0

  const handleCopyToClipboard = useCallback(async () => {
    if (ref.current === null) {
      return
    }

    const blob = await toBlob(ref.current)
    if (blob != null) {
      let data = [new window.ClipboardItem({ [blob.type]: blob })];
      await navigator.clipboard.write(data)
    }
  }, [ref])


  return (
    <div className="map_section">
      <div className="map_container" ref={ref}>
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
      <div className="map_copy">
        {showCopyButton && <button onClick={handleCopyToClipboard}>Copy completed map to clipboard</button>}
      </div>
    </div>
  )
}
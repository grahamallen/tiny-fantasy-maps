import React from "react"
import { deckOfCardsAtom, TileOption } from "./GameState.ts"
import { PlacementRuleComponent } from "./PlacementRule.tsx"
import './Option.css'
import { useSetAtom } from "jotai"

export const Option = ({option}: {option: TileOption}) => {
  const setDeckOfCards = useSetAtom(deckOfCardsAtom)

  return (
    <div className="option" onClick={() => {
      setDeckOfCards(prev => prev.map((nextOption) => nextOption.id === option.id ? { ...nextOption, isSelected: true} : {...nextOption, isSelected: false}))
    }}>
      <div className="option_description">
        <input readOnly className="option_radio" type="radio" checked={option.isSelected} />
        <strong>
          {option.tile.status}
        </strong>
        <p>
          {option.description}
        </p>
      </div>
      <PlacementRuleComponent rule={option.rule} />
    </div>
  )
}
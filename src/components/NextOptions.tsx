import { useAtom } from "jotai"
import React from "react"
import { nextOptionsAtom, turnsRemainingAtom, TileOption, roundsRemianingAtom } from "./GameState.ts"
import { Option } from "./Option.tsx"
import { Scoring } from "./Scoring.tsx"
import "./NextOptions.css"

export const NextOptions = () => {
  const [nextOptions] = useAtom(nextOptionsAtom)
  const [turnsRemaining] = useAtom(turnsRemainingAtom)
  const [roundsRemaining] = useAtom(roundsRemianingAtom)

  return (
    <div className="options_container">
      {nextOptions.length > 0 ? nextOptions.map((nextOption: TileOption, i: number) => {
        return (
          <>
            <Option key={i} option={nextOption}/>
            {i === 0 ? (<div key={"fdjka;fdjsaklf;dsa"}>Turns Remaining: {turnsRemaining} | Rounds Remaining: {roundsRemaining}</div>) : null}
          </>
        )
      }) : <Scoring />}
    </div>
  )
}
import { useAtom } from "jotai"
import React from "react"
import { nextOptionsAtom, turnsRemainingAtom, TileOption, roundsRemainingAtom } from "./GameState.ts"
import { Option } from "./Option.tsx"
import { Scoring } from "./Scoring.tsx"
import { useSpring, animated } from '@react-spring/web'
import "./NextOptions.css"

export const NextOptions = () => {
  const [nextOptions] = useAtom(nextOptionsAtom)
  const [turnsRemaining] = useAtom(turnsRemainingAtom)
  const [roundsRemaining] = useAtom(roundsRemainingAtom)
  const springs = useSpring({
    from: { },
    to: { }
  })

  return (
    <animated.div className="options_container" style={{...springs}}>
      {nextOptions.length > 0 ? nextOptions.map((nextOption: TileOption, i: number) => {
        return (
          <>
            <Option key={i} option={nextOption}/>
            {i === 0 ? (<div key={"fdjka;fdjsaklf;dsa"}>Turns Remaining: {turnsRemaining} | {roundsRemaining === 1 ? "Last Round" : `Rounds Remaining: ${roundsRemaining}`}</div>) : null}
          </>
        )
      }) : <Scoring />}
    </animated.div>
  )
}
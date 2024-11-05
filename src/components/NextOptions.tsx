import { useAtom } from "jotai"
import React from "react"
import { nextOptionsAtom, turnsRemainingAtom, roundsRemainingAtom } from "./GameState.ts"
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
      {nextOptions.length > 0 ? (
        <>
          <Option option={nextOptions[0]}/>
          <div>
            Turns Remaining: {turnsRemaining} | {roundsRemaining === 1 ? "Last Round" : `Rounds Remaining: ${roundsRemaining}`}
          </div>
          <Option option={nextOptions[1]}/>
        </>
      ) : <Scoring />}
    </animated.div>
  )
}
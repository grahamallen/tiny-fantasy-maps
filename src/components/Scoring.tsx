import React from "react"
import { descriptions, getScore, tilesAtom } from "./GameState.ts"
import { useAtom } from "jotai"
import './Scoring.css'

export const Scoring = () => {
  const [tiles] = useAtom(tilesAtom)
  const scores = Object.keys(descriptions).map((key) => getScore(descriptions[key], tiles))

  return (
    <table className="scoring_container">
      <tbody>
        {Object.keys(descriptions).map((key, i) => {
          return (
            <tr key={key}>
              <th>
                {scores[i]}
              </th>
              <td key={key}>
                {descriptions[key]}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
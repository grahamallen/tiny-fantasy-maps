import React from "react"
import { descriptions, scores, tilesAtom } from "./GameState.ts"
import { getScore } from '../utils/scoring.ts';
import { useAtom } from "jotai"
import './Scoring.css'

export const Scoring = () => {
  const [tiles] = useAtom(tilesAtom)
  const scoreTotals = Object.keys(descriptions).map((key) => getScore(key, tiles))
  const total = scoreTotals.reduce((a,c) => a + c, 0)

  return (
    <table className="scoring_container">
      <tbody>
        {Object.keys(descriptions).map((key, i) => {
          return (
            <tr key={key}>
              <th key={`${key}_score`}>
                {scoreTotals[i]}
              </th>
              <td key={`${key}_description`}>
                {scores[key]}
              </td>
            </tr>
          )
        })}
        <tr key={"total"}>
          <th key={"total_score"} style={{borderTop: "solid 1px #25272a"}}>{total}</th>
          <td style={{borderTop: "solid 1px #25272a"}}><strong>Total</strong></td>
        </tr>
      </tbody>
    </table>
  )
}
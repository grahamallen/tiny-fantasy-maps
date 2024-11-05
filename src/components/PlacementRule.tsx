import React from "react";
import { PlacementRule } from "./GameState.ts";
import { getPlacementRuleMatrix } from '../utils/tiles.ts';
import './PlacementRule.css';
import classNames from "classnames";

export const PlacementRuleComponent = ({rule}: {rule: PlacementRule}) => {
  const placementRuleMatrix = getPlacementRuleMatrix(rule || 'all')

  return (
    <div className="placement_rule_container">
      {Array.from({length: 9}).map((_, col_i) => {
        return (
          <div className="placement_rule_row" key={col_i}>
            {Array.from({length: 9}).map((_, row_i) => {
              return (
                <span className={classNames("placement_rule_tile", {
                  "placement_rule_filled": placementRuleMatrix[row_i][col_i] === true 
                })} key={`${col_i}${row_i}`}></span>
              )
            })}
          </div>
        )
      })}
      
    </div>
  )
}
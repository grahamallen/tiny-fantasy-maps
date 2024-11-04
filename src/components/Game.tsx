import React from "react"
import "./Game.css"
import { Map } from './Map.tsx'
import { NextOptions } from "./NextOptions.tsx"

export const Game = () => {
  return (
    <div className="game_container">
      <NextOptions />
      <Map />
    </div>
  )
}
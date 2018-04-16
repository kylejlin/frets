import React from 'react'
import './Frets.css'

const HALF_STEP = 2 ** (1 / 12)

class Frets extends React.Component {
  constructor(props) {
    super(props)

    this.state = {

    }

    this.CELL_WIDTH = 10
    this.CELL_HEIGHT = 10

    this.stringFrequencies = [
      82.41, // E2
      110, // A2
      146.8, // D3
      196, // G3
      246.9, // B3
      329.6 // E4
    ]

    const audioCtx = new AudioContext()
    const gainNode = audioCtx.createGain()
    gainNode.connect(audioCtx.destination)

    this.audioCtx = audioCtx
    this.gainNode = gainNode
  }

  render() {
    const cells = this.generateCells()
    return (
      <div className="Frets">
        {cells.map(cell => {
          return <div
            className="Frets-cell"
            style={{
              left: cell.x * this.CELL_WIDTH,
              top: cell.y * this.CELL_HEIGHT
            }}
            onClick={() => this.onCellClick(cell)}
          />
        })}
      </div>
    )
  }

  generateCells() {
    const cells = []

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 21; j++) {
        cells.push({
          x: j,
          y: i
        })
      }
    }

    return cells
  }

  onCellClick(cell) {
    const oscillator = this.audioCtx.createOscillator()
    oscillator.connect(this.gainNode)
    oscillator.type = 'sine'
    const stringFreq = this.stringFrequencies[cell.y]
    const mult = HALF_STEP ** cell.x
    oscillator.frequency.value = stringFreq * mult

    oscillator.start()
    setTimeout(() => {
      oscillator.stop()
    }, 1e3)
  }
}

export default Frets

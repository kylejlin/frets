import React from 'react'
import './Frets.css'

const HALF_STEP = 2 ** (1 / 12)

class Frets extends React.Component {
  constructor(props) {
    super(props)

    const { cellWidth, cellHeight } = this.calculateCellHeight()
    this.state = {
      cellWidth,
      cellHeight
    }

    this.stringFrequencies = [
      82.41, // E2
      110, // A2
      146.8, // D3
      196, // G3
      246.9, // B3
      329.6 // E4
    ]
    this.markings = [
      {
        x: 5,
        y: 3
      },
      {
        x: 7,
        y: 1.5
      },
      {
        x: 7,
        y: 4.5
      },
      {
        x: 9,
        y: 3
      },
      {
        x: 12,
        y: 1.5
      },
      {
        x: 12,
        y: 4.5
      },
      {
        x: 15,
        y: 3
      },
      {
        x: 17,
        y: 3
      }
    ]

    this.strings = [0, 1, 2, 3, 4, 5]

    const audioCtx = new AudioContext()
    const gainNode = audioCtx.createGain()
    gainNode.connect(audioCtx.destination)

    this.audioCtx = audioCtx
    this.gainNode = gainNode

    window.addEventListener('resize', () => {
      this.calculateCellHeight()
      this.forceUpdate()
    })
  }

  render() {
    const cells = this.generateCells()
    return (
      <div className="Frets">
        {cells.map(cell => {
          return <div
            className={'Frets-cell' + (cell.x === 0 ? ' Frets-zeroth-cell' : '')}
            style={{
              left: cell.x * this.state.cellWidth,
              top: cell.y * this.state.cellHeight
            }}
            onClick={() => this.onCellClick(cell)}
          />
        })}
        {this.markings.map(marking => {
          return <div
            className="Frets-marking"
            style={{
              left: marking.x * this.state.cellWidth,
              top: marking.y * this.state.cellHeight
            }}
          />
        })}
        {this.strings.map(string => {
          return <div
            className="Frets-string"
            style={{
              top: (string + 0.5) * this.state.cellHeight
            }}
          />
        })}
      </div>
    )
  }

  calculateCellHeight() {
    const width = window.innerWidth / 21
    const height = window.innerHeight / 6

    document.body.style.setProperty('--cell-width', width + 'px')
    document.body.style.setProperty('--cell-height', height + 'px')
    document.body.style.setProperty('--marking-diameter', width + 'px')

    const dimensions = {
      cellWidth: width,
      cellHeight: height
    }

    this.setState(dimensions)

    return dimensions
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
    }, 5e2)
  }
}

export default Frets

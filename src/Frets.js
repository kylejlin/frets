import React from 'react'
import './Frets.css'
import defaultSettings from './defaultSettings'

const HALF_STEP = 2 ** (1 / 12)

class Frets extends React.Component {
  constructor(props) {
    super(props)

    const { cellWidth, cellHeight } = this.calculateCellHeight()
    
    this.state = {
      cellWidth,
      cellHeight,
      settings: defaultSettings
    }

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
    const cells = this.generateCells(this.state.settings)
    const { strings, markings } = this.state.settings

    return (
      <div className="Frets">
        {cells.map(cell => {
          return <div
            className={'Frets-cell' + (cell.x === 0 ? ' Frets-zeroth-cell' : '')}
            style={{
              left: cell.x * this.state.cellWidth,
              top: cell.y * this.state.cellHeight
            }}
            onClick={() => this.onCellClick(cell, this.state.settings)}
          />
        })}
        {markings.map(marking => {
          return <div
            className="Frets-marking"
            style={{
              left: marking.x * this.state.cellWidth,
              top: marking.y * this.state.cellHeight
            }}
          />
        })}
        {strings.map(({}, i) => {
          return <div
            className="Frets-string"
            style={{
              top: (i + 0.5) * this.state.cellHeight
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

  generateCells(settings) {
    const { strings, frets } = settings
    const numOfStrings = strings.length
    const cells = []

    for (let i = 0; i < numOfStrings; i++) {
      for (let j = 0; j < frets; j++) {
        cells.push({
          x: j,
          y: i
        })
      }
    }

    return cells
  }

  onCellClick(cell, settings) {
    const oscillator = this.audioCtx.createOscillator()
    oscillator.connect(this.gainNode)
    oscillator.type = 'sine'
    const stringFrequency = settings.strings[cell.y]
    const multiplier = HALF_STEP ** cell.x
    oscillator.frequency.value = stringFrequency * multiplier

    oscillator.start()
    setTimeout(() => {
      oscillator.stop()
    }, 5e2)
  }
}

export default Frets

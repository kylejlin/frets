import React from 'react'
import './Frets.css'
import guitarSettings from './guitarSettings'
import bassSettings from './bassSettings'

const HALF_STEP = 2 ** (1 / 12)

class Frets extends React.Component {
  constructor(props) {
    super(props)

    const defaultSettings = (window.location + '').indexOf('bass') > -1
      ? bassSettings
      : guitarSettings

    const { cellWidth, cellHeight } = this.calculateCellHeight(defaultSettings)

    const audioCtx = new AudioContext()
    const gainNode = audioCtx.createGain()
    gainNode.connect(audioCtx.destination)

    this.state = {
      cellWidth,
      cellHeight,
      settings: defaultSettings,
      strings: this.setUpStrings(defaultSettings, audioCtx, gainNode)
    }

    this.audioCtx = audioCtx
    this.gainNode = gainNode

    window.addEventListener('resize', () => {
      this.calculateCellHeight(this.state.settings)
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
            className={'Frets-cell' + (cell.x === this.state.settings.frets ? ' Frets-zeroth-cell' : '')}
            style={{
              left: cell.x * this.state.cellWidth,
              top: (this.state.settings.strings.length - cell.y - 1) * this.state.cellHeight
            }}
            onClick={() => {
              if ('ontouchstart' in document) {
                return // Let touch handlers do the work
              }
              if (cell.x === this.state.settings.frets) {
                this.playCell({ x: 0, y: cell.y }, this.state.settings)
                return
              }
              this.playCell({ x: cell.x + 1, y: cell.y }, this.state.settings)
            }}
            onTouchStart={
              cell.x === this.state.settings.frets
                ? () => this.startActivator(cell, this.state.settings)
                : () => this.pressCell(cell, this.state.settings)
            }
            onTouchEnd={
              cell.x === this.state.settings.frets
                ? () => this.stopActivator(cell, this.state.settings)
                : () => this.unpressCell(cell, this.state.settings)
            }
          />
        })}
        {markings.map(marking => {
          return <div
            className="Frets-marking"
            style={{
              left: (marking.x - 1) * this.state.cellWidth,
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

  calculateCellHeight(settings) {
    const width = window.innerWidth / (settings.frets + 1)
    const height = window.innerHeight / settings.strings.length

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
      for (let j = 0; j < frets + 1; j++) {
        cells.push({
          x: j,
          y: i
        })
      }
    }

    return cells
  }

  playCell(cell, settings) {
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

  pressCell(cell) {
    this.setState(prevState => ({
      strings: prevState.strings.map((string, i) => {
        if (i !== cell.y) {
          return string
        }
        return {
          ...string,
          pressedFrets: string.pressedFrets.concat([cell.x + 1])
        }
      })
    }), () => {
      const string = this.state.strings[cell.y]
      string.updateFrequency(string.pressedFrets)
    })
  }

  setUpStrings(settings, audioCtx, masterGainNode) {
    const strings = settings.strings.map(stringFrequency => {
      const oscillator = audioCtx.createOscillator()
      const stringGainNode = audioCtx.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = stringFrequency
      oscillator.connect(stringGainNode)
      stringGainNode.connect(masterGainNode)
      stringGainNode.gain.value = 0
      oscillator.start()

      const string = {
        start: () => {
          stringGainNode.gain.value = 1
        },
        stop: () => {
          stringGainNode.gain.value = 0
        },
        pressedFrets: [],
        updateFrequency: pressedFrets => {
          if (pressedFrets.length === 0) {
            oscillator.frequency.value = stringFrequency
            return
          }

          const highestFret = Math.max(...pressedFrets)
          const multiplier = HALF_STEP ** highestFret
          oscillator.frequency.value = stringFrequency * multiplier
        }
      }

      return string
    })

    return strings
  }

  startActivator(cell) {
    this.state.strings[cell.y].start()
  }

  stopActivator(cell) {
    this.state.strings[cell.y].stop()
  }

  unpressCell(cell) {
    this.setState(prevState => ({
      strings: prevState.strings.map((string, i) => {
        if (i !== cell.y) {
          return string
        }
        return {
          ...string,
          pressedFrets: string.pressedFrets.filter(fret => fret !== (cell.x + 1))
        }
      })
    }), () => {
      const string = this.state.strings[cell.y]
      string.updateFrequency(string.pressedFrets)
    })
  }
}

export default Frets

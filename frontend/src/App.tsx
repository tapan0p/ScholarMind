import { useState, useEffect } from 'react'
import Split from 'react-split'
import './App.css'

// Import components (we'll create these next)
import FileExplorer from './components/FileExplorer'
import Reader from './components/Reader'
import Chat from './components/Chat'

function App() {
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const [sizes, setSizes] = useState([15, 55, 30])

  useEffect(() => {
    // Update sizes when panels are collapsed/expanded
    if (leftCollapsed && rightCollapsed) {
      setSizes([0, 100, 0])
    } else if (leftCollapsed) {
      setSizes([0, 70, 30])
    } else if (rightCollapsed) {
      setSizes([15, 85, 0])
    } else {
      setSizes([15, 55, 30])
    }
  }, [leftCollapsed, rightCollapsed])

  return (
    <div className="app-container">
      <Split 
        sizes={sizes}
        minSize={[0, 300, 0]}
        gutterSize={10}
        className="split-container"
        onDragEnd={(sizes) => setSizes(sizes)}
      >
        <div className={`panel left-panel ${leftCollapsed ? 'collapsed' : ''}`}>
          <div className="panel-content">
            <FileExplorer />
          </div>
          <button 
            className="collapse-btn"
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            title={leftCollapsed ? 'Show Files' : 'Hide Files'}
            style={{ 
              position: 'absolute', 
              right: leftCollapsed ? '-30px' : '10px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            {leftCollapsed ? '⮞' : '⮜'}
          </button>
        </div>

        <div className="panel middle-panel">
          <div className="panel-content">
            <Reader />
          </div>
        </div>

        <div className={`panel right-panel ${rightCollapsed ? 'collapsed' : ''}`}>
          <div className="panel-content">
            <Chat />
          </div>
          <button 
            className="collapse-btn"
            onClick={() => setRightCollapsed(!rightCollapsed)}
            title={rightCollapsed ? 'Show Chat' : 'Hide Chat'}
            style={{ 
              position: 'absolute', 
              left: rightCollapsed ? '-30px' : '10px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            {rightCollapsed ? '⮜' : '⮞'}
          </button>
        </div>
      </Split>
    </div>
  )
}

export default App
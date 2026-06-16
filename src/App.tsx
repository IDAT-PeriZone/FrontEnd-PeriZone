import { useState, useEffect, useRef } from 'react'
import './App.css'

interface SystemLog {
  id: string;
  time: string;
  text: string;
  type: 'system' | 'success' | 'warning' | 'error';
}

interface NetworkNode {
  id: string;
  name: string;
  ip: string;
  status: 'active' | 'inactive';
}

function App() {
  const generateId = () => Math.random().toString(36).substring(2, 9) + '-' + Date.now();

  // Real-time Clock
  const [timeStr, setTimeStr] = useState<string>('')
  
  // Stats states
  const [cpuLoad, setCpuLoad] = useState<number>(42)
  const [latency, setLatency] = useState<number>(24)
  const [ramUsage, setRamUsage] = useState<number>(64)
  
  // Nodes state
  const [nodes, setNodes] = useState<NetworkNode[]>([
    { id: '1', name: 'Nodo Alpha', ip: '10.0.0.12', status: 'active' },
    { id: '2', name: 'Nodo Beta', ip: '192.168.1.45', status: 'active' },
    { id: '3', name: 'Nodo Gamma', ip: '172.16.5.99', status: 'active' }
  ])
  const [newNodeName, setNewNodeName] = useState<string>('')
  
  // Modal Overlay
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false)
  
  // System Log Terminal State
  const [logs, setLogs] = useState<SystemLog[]>([
    { id: '1', time: '21:21:08', text: 'Central de PeriZone inicializada correctamente.', type: 'system' },
    { id: '2', time: '21:21:10', text: 'Estableciendo comunicación de red segura...', type: 'system' },
    { id: '3', time: '21:21:12', text: 'Nodo Alpha conectado con latencia de 12ms.', type: 'success' },
    { id: '4', time: '21:21:15', text: 'Nodo Beta sincronizando base de datos.', type: 'success' }
  ])
  
  const consoleEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll logs
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  // Update Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setTimeStr(now.toTimeString().split(' ')[0])
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  // Simulate dynamic stats fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      // CPU fluctuations
      setCpuLoad(prev => {
        const diff = Math.floor(Math.random() * 15) - 7
        const nextVal = Math.min(Math.max(prev + diff, 25), 95)
        return nextVal
      })
      
      // Latency fluctuations
      setLatency(prev => {
        const diff = Math.floor(Math.random() * 9) - 4
        return Math.min(Math.max(prev + diff, 10), 99)
      })

      // Memory fluctuations
      setRamUsage(prev => {
        const diff = Math.floor(Math.random() * 5) - 2
        return Math.min(Math.max(prev + diff, 55), 85)
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Simulate new incoming system logs
  useEffect(() => {
    const logTemplates: { text: string; type: SystemLog['type'] }[] = [
      { text: 'Optimización de consumo de memoria completada.', type: 'success' },
      { text: 'Escaneo de seguridad del cortafuegos finalizado sin amenazas.', type: 'success' },
      { text: 'Advertencia: Incremento inusual en tráfico de Nodo Beta.', type: 'warning' },
      { text: 'Conexión con Nodo Gamma restablecida tras pérdida de paquetes.', type: 'success' },
      { text: 'Petición entrante API autenticada y autorizada.', type: 'system' },
      { text: 'Error: Fallo temporal en la réplica del disco local.', type: 'error' },
      { text: 'Estadísticas del sistema enviadas al servidor central.', type: 'system' }
    ]

    const interval = setInterval(() => {
      const activeNodeCount = nodes.filter(n => n.status === 'active').length
      if (activeNodeCount === 0) {
        setLogs(prev => [
          ...prev,
          {
            id: generateId(),
            time: new Date().toTimeString().split(' ')[0],
            text: 'CRÍTICO: No hay nodos de red activos configurados.',
            type: 'error'
          }
        ])
        return
      }

      const randomTemplate = logTemplates[Math.floor(Math.random() * logTemplates.length)]
      setLogs(prev => [
        ...prev,
        {
          id: generateId(),
          time: new Date().toTimeString().split(' ')[0],
          text: randomTemplate.text,
          type: randomTemplate.type
        }
      ])
    }, 6000)

    return () => clearInterval(interval)
  }, [nodes])

  // Add a new Node
  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNodeName.trim()) return

    const randomOctet1 = Math.floor(Math.random() * 223) + 1
    const randomOctet2 = Math.floor(Math.random() * 255)
    const randomOctet3 = Math.floor(Math.random() * 255)
    const randomOctet4 = Math.floor(Math.random() * 254) + 1
    const generatedIp = `${randomOctet1}.${randomOctet2}.${randomOctet3}.${randomOctet4}`

    const newNode: NetworkNode = {
      id: generateId(),
      name: newNodeName.trim(),
      ip: generatedIp,
      status: 'active'
    }

    setNodes(prev => [...prev, newNode])
    setNewNodeName('')

    // Append log
    setLogs(prev => [
      ...prev,
      {
        id: generateId(),
        time: new Date().toTimeString().split(' ')[0],
        text: `Nuevo nodo "${newNode.name}" registrado con IP ${newNode.ip}`,
        type: 'success'
      }
    ])
  }

  // Toggle Node status
  const handleToggleNode = (id: string) => {
    setNodes(prev =>
      prev.map(node => {
        if (node.id === id) {
          const nextStatus = node.status === 'active' ? 'inactive' : 'active'
          // Add log for this change
          setLogs(logList => [
            ...logList,
            {
              id: generateId(),
              time: new Date().toTimeString().split(' ')[0],
              text: `Nodo "${node.name}" cambiado a estado ${nextStatus === 'active' ? 'ACTIVO' : 'INACTIVO'}.`,
              type: nextStatus === 'active' ? 'success' : 'warning'
            }
          ])
          return { ...node, status: nextStatus }
        }
        return node
      })
    )
  }

  // Delete a Node
  const handleDeleteNode = (id: string) => {
    const nodeToDelete = nodes.find(node => node.id === id)
    if (!nodeToDelete) return

    setNodes(prev => prev.filter(node => node.id !== id))
    setLogs(prev => [
      ...prev,
      {
        id: generateId(),
        time: new Date().toTimeString().split(' ')[0],
        text: `Nodo "${nodeToDelete.name}" removido de la red central.`,
        type: 'error'
      }
    ])
  }

  return (
    <div className="app-container">
      {/* Background blobs for premium depth */}
      <div className="glow-blob glow-blob-1"></div>
      <div className="glow-blob glow-blob-2"></div>

      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">
            <div className="brand-logo-icon">P</div>
            <span>PeriZone</span>
          </div>
          <div className="status-beacon">
            <span className={`beacon-dot ${nodes.filter(n => n.status === 'active').length === 0 ? 'offline' : ''}`}></span>
            <span>{nodes.filter(n => n.status === 'active').length > 0 ? 'SISTEMA ONLINE' : 'SISTEMA DESCONECTADO'}</span>
          </div>
        </div>

        <nav>
          <ul className="nav-links">
            <li><a href="#dashboard" className="active">Panel Principal</a></li>
            <li><a href="#nodes">Nodos de Red</a></li>
            <li><a href="#console">Terminal</a></li>
          </ul>
        </nav>

        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowConfigModal(true)}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px' }}>
              <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
              <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.893 1.64.902 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.185 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.185l-.292-.159a1.873 1.873 0 0 0-2.692 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.693-1.115l-.291.16c-.764.415-1.6-.42-1.185-1.185l.159-.292a1.873 1.873 0 0 0-1.116-2.692l-.318-.094c-.835-.246-.835-1.428 0-1.674l.319-.094a1.873 1.873 0 0 0 1.115-2.693l-.16-.291c-.415-.764.42-1.6 1.185-1.185l.292.159a1.873 1.873 0 0 0 2.692-1.116l.094-.318z"/>
            </svg>
            Configuración
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Hero Dashboard Bar */}
        <section className="hero-dashboard">
          <div className="hero-text">
            <h2>Consola Central <span className="gradient-text">PeriZone</span></h2>
            <p>Monitoreo inteligente de red, procesamiento de nodos y simulación analítica.</p>
          </div>
          <div className="live-timer">
            <div className="time">{timeStr || '00:00:00'}</div>
            <div className="label">Hora de Red Local</div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="stats-grid">
          {/* CPU Load Stat */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Procesamiento CPU</span>
              <span className="stat-icon">⚡</span>
            </div>
            <div className="stat-value">{cpuLoad}%</div>
            <div className="progress-container">
              <div 
                className={`progress-bar ${cpuLoad > 85 ? 'warning' : ''}`} 
                style={{ width: `${cpuLoad}%` }}
              ></div>
            </div>
            <div className="stat-footer">
              <span>Frecuencia: 4.8 GHz</span>
              <span>Temp: 64°C</span>
            </div>
          </div>

          {/* Connected Nodes */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Nodos Activos</span>
              <span className="stat-icon">🌐</span>
            </div>
            <div className="stat-value">
              {nodes.filter(n => n.status === 'active').length} / {nodes.length}
            </div>
            <div className="progress-container">
              <div 
                className="progress-bar" 
                style={{ width: `${(nodes.filter(n => n.status === 'active').length / nodes.length) * 100}%` }}
              ></div>
            </div>
            <div className="stat-footer">
              <span>IP Principal: 10.0.0.12</span>
              <span>Subred: 255.255.255.0</span>
            </div>
          </div>

          {/* Network Latency */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Latencia Promedio</span>
              <span className="stat-icon">📶</span>
            </div>
            <div className="stat-value">{latency}ms</div>
            <div className="progress-container">
              <div 
                className="progress-bar" 
                style={{ width: `${Math.min(latency * 1.5, 100)}%` }}
              ></div>
            </div>
            <div className="stat-footer">
              <span>Ping: Estable</span>
              <span>Pérdidas: 0%</span>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Asignación de Memoria</span>
              <span className="stat-icon">💾</span>
            </div>
            <div className="stat-value">{ramUsage}%</div>
            <div className="progress-container">
              <div 
                className="progress-bar" 
                style={{ width: `${ramUsage}%` }}
              ></div>
            </div>
            <div className="stat-footer">
              <span>Usado: {(16 * ramUsage / 100).toFixed(1)} GB</span>
              <span>Total: 16.0 GB</span>
            </div>
          </div>
        </section>

        {/* Dual Column Layout */}
        <div className="dashboard-details">
          
          {/* Interactive Nodes list card */}
          <section id="nodes" className="section-card">
            <div className="section-title">
              <span>Nodos Conectados ({nodes.length})</span>
              <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', fontWeight: 'normal' }}>
                Haz clic en el indicador para activar/desactivar
              </span>
            </div>

            {/* Add Node Form */}
            <form onSubmit={handleAddNode} className="node-form">
              <input 
                type="text" 
                placeholder="Nombre del nuevo nodo..." 
                className="form-input" 
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
              />
              <button type="submit" className="btn-primary">
                + Agregar
              </button>
            </form>

            {/* Node Items List */}
            <div className="node-list">
              {nodes.map(node => (
                <div key={node.id} className="node-item">
                  <div className="node-info">
                    <span 
                      className={`node-status-indicator ${node.status === 'inactive' ? 'inactive' : ''}`}
                      title={node.status === 'active' ? 'Click para pausar' : 'Click para activar'}
                      onClick={() => handleToggleNode(node.id)}
                      style={{ cursor: 'pointer' }}
                    ></span>
                    <div className="node-details">
                      <span className="node-name">{node.name}</span>
                      <span className="node-ip">{node.ip}</span>
                    </div>
                  </div>
                  <div className="node-actions">
                    <button 
                      className={`btn-secondary`} 
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => handleToggleNode(node.id)}
                    >
                      {node.status === 'active' ? 'Pausar' : 'Reanudar'}
                    </button>
                    <button 
                      className="btn-icon delete" 
                      onClick={() => handleDeleteNode(node.id)}
                      title="Eliminar nodo"
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {nodes.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'hsl(var(--text-muted))' }}>
                  No hay nodos configurados. Registra un nodo en el formulario superior.
                </div>
              )}
            </div>
          </section>

          {/* Console Log Log terminal */}
          <section id="console" className="section-card">
            <div className="section-title">
              <span>Terminal de Eventos</span>
              <button 
                className="btn-secondary" 
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                onClick={() => setLogs([])}
              >
                Limpiar Terminal
              </button>
            </div>
            <div className="console-log">
              {logs.map(log => (
                <div key={log.id} className={`log-line ${log.type}`}>
                  <span className="log-time">[{log.time}]</span>
                  <span className="log-text">{log.text}</span>
                </div>
              ))}
              <div ref={consoleEndRef} />
            </div>
            <div style={{ marginTop: '0.85rem', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', display: 'flex', justifyContent: 'space-between' }}>
              <span>Logs simulados activos</span>
              <span>Frecuencia de refresco: 6s</span>
            </div>
          </section>

        </div>

      </main>

      {/* Modal Dialog */}
      {showConfigModal && (
        <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Configuración PeriZone</div>
            <div className="modal-body">
              <p style={{ marginBottom: '1rem' }}>
                A continuación se muestra la plantilla de configuración central del nodo maestro de PeriZone en formato JSON.
              </p>
              <pre style={{ 
                background: '#050608', 
                color: '#34d399', 
                padding: '1rem', 
                borderRadius: '8px', 
                fontSize: '0.8rem', 
                overflowX: 'auto',
                fontFamily: 'monospace'
              }}>
{`{
  "system": {
    "name": "PeriZone-Central",
    "version": "1.0.0",
    "environment": "production"
  },
  "nodes": [
    ${nodes.map(n => `{"name": "${n.name}", "ip": "${n.ip}", "status": "${n.status}"}`).join(',\n    ')}
  ],
  "monitoring": {
    "intervalMs": 6000,
    "metrics": ["cpu", "latency", "memory"]
  }
}`}
              </pre>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowConfigModal(false)}>
                Cerrar
              </button>
              <button className="btn-primary" onClick={() => {
                setShowConfigModal(false)
                // Add console log
                setLogs(prev => [
                  ...prev,
                  {
                    id: generateId(),
                    time: new Date().toTimeString().split(' ')[0],
                    text: 'Configuración guardada e inyectada en los nodos.',
                    type: 'success'
                  }
                ])
              }}>
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2026 PeriZone. Todos los derechos reservados. Diseñado para alto rendimiento y estética avanzada.</p>
        <div className="app-footer-links">
          <a href="#privacy">Privacidad</a>
          <a href="#terms">Términos de Uso</a>
          <a href="#support">Soporte Tecnológico</a>
        </div>
      </footer>
    </div>
  )
}

export default App

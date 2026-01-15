import { useState } from 'react'
import api from '../api'

function AdminSection() {
  const [healthStatus, setHealthStatus] = useState(null)
  const [importResult, setImportResult] = useState(null)
  const [migrateResult, setMigrateResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleHealthCheck = async () => {
    setLoading(true)
    try {
      const response = await api.get('/health')
      setHealthStatus({ success: true, data: response.data })
    } catch (error) {
      setHealthStatus({ 
        success: false, 
        error: error.response?.data || { error: error.message } 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImportReset = async () => {
    setLoading(true)
    setImportResult(null)
    try {
      const response = await api.post('/import_reset')
      setImportResult({ success: true, data: response.data })
    } catch (error) {
      setImportResult({ 
        success: false, 
        error: error.response?.data || { error: error.message } 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMigrate = async () => {
    setLoading(true)
    setMigrateResult(null)
    try {
      const response = await api.post('/migrate_to_mongo')
      setMigrateResult({ success: true, data: response.data })
    } catch (error) {
      setMigrateResult({ 
        success: false, 
        error: error.response?.data || { error: error.message } 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section">
      <h2>Admin / Setup</h2>
      
      <div style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
        <strong>⚠️ First Time Setup:</strong> Click "Import & Reset Data" below to initialize the database before using Student 1 or Student 2 features.
      </div>
      
      <div className="form-group">
        <h3>Health Check</h3>
        <button onClick={handleHealthCheck} disabled={loading}>
          Check Health
        </button>
        {healthStatus && (
          <div className={`result ${healthStatus.success ? 'success' : 'error'}`}>
            {healthStatus.success ? (
              <div>✓ {healthStatus.data.message || 'OK'}</div>
            ) : (
              <>
                <div>✗ Error: {healthStatus.error.error}</div>
                {healthStatus.error.stack && (
                  <pre>{healthStatus.error.stack}</pre>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="form-group">
        <h3>Import / Reset (MariaDB)</h3>
        <button onClick={handleImportReset} disabled={loading} className="secondary">
          Import & Reset Data
        </button>
        {importResult && (
          <div className={`result ${importResult.success ? 'success' : 'error'}`}>
            {importResult.success ? (
              <>
                <div>✓ Import successful!</div>
                <pre>{JSON.stringify(importResult.data, null, 2)}</pre>
              </>
            ) : (
              <>
                <div>✗ Error: {importResult.error.error}</div>
                {importResult.error.stack && (
                  <pre>{importResult.error.stack}</pre>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="form-group">
        <h3>Migrate SQL → Mongo</h3>
        <button onClick={handleMigrate} disabled={loading} className="success">
          Migrate to MongoDB
        </button>
        {migrateResult && (
          <div className={`result ${migrateResult.success ? 'success' : 'error'}`}>
            {migrateResult.success ? (
              <>
                <div>✓ Migration successful!</div>
                <pre>{JSON.stringify(migrateResult.data, null, 2)}</pre>
              </>
            ) : (
              <>
                <div>✗ Error: {migrateResult.error.error}</div>
                {migrateResult.error.stack && (
                  <pre>{migrateResult.error.stack}</pre>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminSection

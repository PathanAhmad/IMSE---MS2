import { useState, useEffect } from 'react'
import api from '../api'

function Student2Section() {
  const [mode, setMode] = useState('sql')
  
  // Helper data
  const [riders, setRiders] = useState([])
  const [orders, setOrders] = useState([])
  
  // Assign Delivery state
  const [assignForm, setAssignForm] = useState({
    riderEmail: '',
    orderId: '',
    deliveryStatus: 'assigned'
  })
  const [assignResult, setAssignResult] = useState(null)
  
  // Report state
  const [reportForm, setReportForm] = useState({
    riderEmail: '',
    from: '',
    to: '',
    deliveryStatus: ''
  })
  const [reportResult, setReportResult] = useState(null)
  
  const [loading, setLoading] = useState(false)

  // Load riders and orders
  useEffect(() => {
    loadRiders()
    loadOrders()
  }, [])

  const loadRiders = async () => {
    try {
      const response = await api.get('/riders')
      if (response.data.riders) {
        setRiders(response.data.riders)
      }
    } catch (error) {
      console.error('Error loading riders:', error)
    }
  }

  const loadOrders = async () => {
    try {
      const response = await api.get('/orders?status=created&limit=50')
      if (response.data.orders) {
        setOrders(response.data.orders)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  const handleAssignDelivery = async (e) => {
    e.preventDefault()
    setLoading(true)
    setAssignResult(null)
    
    try {
      const endpoint = `/student2/${mode}/assign_delivery`
      const payload = {
        riderEmail: assignForm.riderEmail,
        orderId: parseInt(assignForm.orderId),
        deliveryStatus: assignForm.deliveryStatus
      }
      
      const response = await api.post(endpoint, payload)
      setAssignResult({ success: true, data: response.data })
      
      // Reload orders after assignment
      loadOrders()
    } catch (error) {
      setAssignResult({ 
        success: false, 
        error: error.response?.data || { error: error.message } 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReport = async (e) => {
    e.preventDefault()
    setLoading(true)
    setReportResult(null)
    
    try {
      const endpoint = `/student2/${mode}/report`
      const params = new URLSearchParams()
      params.append('riderEmail', reportForm.riderEmail)
      if (reportForm.from) params.append('from', reportForm.from)
      if (reportForm.to) params.append('to', reportForm.to)
      if (reportForm.deliveryStatus) params.append('deliveryStatus', reportForm.deliveryStatus)
      
      const response = await api.get(`${endpoint}?${params}`)
      setReportResult({ success: true, data: response.data })
    } catch (error) {
      setReportResult({ 
        success: false, 
        error: error.response?.data || { error: error.message } 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section">
      <h2>Student 2 - Assign Rider & Delivery Status</h2>
      
      <div className="tabs">
        <button 
          className={`tab ${mode === 'sql' ? 'active' : ''}`}
          onClick={() => setMode('sql')}
        >
          SQL Mode
        </button>
        <button 
          className={`tab ${mode === 'mongo' ? 'active' : ''}`}
          onClick={() => setMode('mongo')}
        >
          Mongo Mode
        </button>
      </div>

      {/* Assign Delivery Form */}
      <form onSubmit={handleAssignDelivery}>
        <h3>Assign Delivery</h3>
        
        <div className="form-group">
          <label>Rider Email</label>
          <select
            value={assignForm.riderEmail}
            onChange={(e) => setAssignForm({ ...assignForm, riderEmail: e.target.value })}
            required
          >
            <option value="">Select a rider...</option>
            {riders.map(rider => (
              <option key={rider.email} value={rider.email}>
                {rider.name} ({rider.email})
              </option>
            ))}
          </select>
          <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
            Or type manually:
          </small>
          <input
            type="email"
            value={assignForm.riderEmail}
            onChange={(e) => setAssignForm({ ...assignForm, riderEmail: e.target.value })}
            placeholder="rider1@example.com (rider1-10)"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Order ID</label>
          <select
            value={assignForm.orderId}
            onChange={(e) => setAssignForm({ ...assignForm, orderId: e.target.value })}
            required
          >
            <option value="">Select an order...</option>
            {orders.map(order => (
              <option key={order.orderId} value={order.orderId}>
                Order #{order.orderId} - {order.status || 'created'}
              </option>
            ))}
          </select>
          <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
            Or type manually:
          </small>
          <input
            type="number"
            value={assignForm.orderId}
            onChange={(e) => setAssignForm({ ...assignForm, orderId: e.target.value })}
            placeholder="Order ID"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Delivery Status</label>
          <select
            value={assignForm.deliveryStatus}
            onChange={(e) => setAssignForm({ ...assignForm, deliveryStatus: e.target.value })}
            required
          >
            <option value="assigned">Assigned</option>
            <option value="picked_up">Picked Up</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>Assign Delivery</button>
      </form>

      {assignResult && (
        <div className={`result ${assignResult.success ? 'success' : 'error'}`}>
          {assignResult.success ? (
            <>
              <div>✓ Delivery assigned successfully!</div>
              <pre>{JSON.stringify(assignResult.data, null, 2)}</pre>
            </>
          ) : (
            <>
              <div>✗ Error: {assignResult.error.error}</div>
              {assignResult.error.stack && <pre>{assignResult.error.stack}</pre>}
            </>
          )}
        </div>
      )}

      {/* Report Form */}
      <form onSubmit={handleReport} style={{ marginTop: '30px' }}>
        <h3>Student 2 Report</h3>
        
        <div className="form-group">
          <label>Rider Email (required)</label>
          <select
            value={reportForm.riderEmail}
            onChange={(e) => setReportForm({ ...reportForm, riderEmail: e.target.value })}
          >
            <option value="">Select a rider...</option>
            {riders.map(rider => (
              <option key={rider.email} value={rider.email}>
                {rider.name} ({rider.email})
              </option>
            ))}
          </select>
          <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
            Or type manually:
          </small>
          <input
            type="email"
            value={reportForm.riderEmail}
            onChange={(e) => setReportForm({ ...reportForm, riderEmail: e.target.value })}
            placeholder="rider1@example.com (rider1-10)"
            required
          />
        </div>
        
        <div className="form-group">
          <label>From (optional)</label>
          <input
            type="datetime-local"
            value={reportForm.from}
            onChange={(e) => setReportForm({ ...reportForm, from: e.target.value })}
          />
        </div>
        
        <div className="form-group">
          <label>To (optional)</label>
          <input
            type="datetime-local"
            value={reportForm.to}
            onChange={(e) => setReportForm({ ...reportForm, to: e.target.value })}
          />
        </div>
        
        <div className="form-group">
          <label>Delivery Status (optional)</label>
          <select
            value={reportForm.deliveryStatus}
            onChange={(e) => setReportForm({ ...reportForm, deliveryStatus: e.target.value })}
          >
            <option value="">All statuses</option>
            <option value="assigned">Assigned</option>
            <option value="picked_up">Picked Up</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>Get Report</button>
      </form>

      {reportResult && (
        <div className={`result ${reportResult.success ? 'success' : 'error'}`}>
          {reportResult.success ? (
            <>
              <div>✓ Report generated</div>
              {reportResult.data.rows && reportResult.data.rows.length > 0 ? (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        {Object.keys(reportResult.data.rows[0]).map(key => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportResult.data.rows.map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((val, i) => (
                            <td key={i}>{JSON.stringify(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div>No data found</div>
              )}
            </>
          ) : (
            <>
              <div>✗ Error: {reportResult.error.error}</div>
              {reportResult.error.stack && <pre>{reportResult.error.stack}</pre>}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Student2Section

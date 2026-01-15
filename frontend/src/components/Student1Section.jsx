import { useState, useEffect } from 'react'
import api from '../api'

function Student1Section() {
  const [mode, setMode] = useState('sql')
  
  // Helper data
  const [customers, setCustomers] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [menuItems, setMenuItems] = useState([])
  
  // Place Order state
  const [orderForm, setOrderForm] = useState({
    customerEmail: '',
    restaurantName: '',
    items: [{ menuItemId: '', menuItemName: '', name: '', unitPrice: '', quantity: 1 }]
  })
  const [orderResult, setOrderResult] = useState(null)
  
  // Pay Order state
  const [payForm, setPayForm] = useState({
    orderId: '',
    paymentMethod: 'card'
  })
  const [payResult, setPayResult] = useState(null)
  
  // Report state
  const [reportForm, setReportForm] = useState({
    restaurantName: '',
    from: '',
    to: ''
  })
  const [reportResult, setReportResult] = useState(null)
  
  const [loading, setLoading] = useState(false)

  // Load helper data on mount
  useEffect(() => {
    loadCustomers()
    loadRestaurants()
  }, [])

  // Load menu items when restaurant changes
  useEffect(() => {
    if (orderForm.restaurantName) {
      loadMenuItems(orderForm.restaurantName)
    }
  }, [orderForm.restaurantName])

  const loadCustomers = async () => {
    try {
      const response = await api.get('/customers')
      if (response.data.customers) {
        setCustomers(response.data.customers)
      }
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  const loadRestaurants = async () => {
    try {
      const response = await api.get('/restaurants')
      if (response.data.restaurants) {
        setRestaurants(response.data.restaurants)
      }
    } catch (error) {
      console.error('Error loading restaurants:', error)
    }
  }

  const loadMenuItems = async (restaurantName) => {
    try {
      const response = await api.get(`/menu_items?restaurantName=${encodeURIComponent(restaurantName)}`)
      if (response.data.menuItems) {
        setMenuItems(response.data.menuItems)
      }
    } catch (error) {
      console.error('Error loading menu items:', error)
      setMenuItems([])
    }
  }

  const handleAddItem = () => {
    setOrderForm({
      ...orderForm,
      items: [...orderForm.items, { menuItemId: '', menuItemName: '', name: '', unitPrice: '', quantity: 1 }]
    })
  }

  const handleRemoveItem = (index) => {
    const newItems = orderForm.items.filter((_, i) => i !== index)
    setOrderForm({ ...orderForm, items: newItems })
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderForm.items]
    newItems[index][field] = value
    setOrderForm({ ...orderForm, items: newItems })
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setLoading(true)
    setOrderResult(null)
    
    try {
      const endpoint = `/student1/${mode}/place_order`
      let payload = {
        customerEmail: orderForm.customerEmail,
        restaurantName: orderForm.restaurantName,
        items: orderForm.items.map(item => {
          if (mode === 'sql') {
            return {
              quantity: parseInt(item.quantity),
              ...(item.menuItemId ? { menuItemId: parseInt(item.menuItemId) } : {}),
              ...(item.menuItemName ? { menuItemName: item.menuItemName } : {})
            }
          } else {
            return {
              name: item.name,
              unitPrice: parseFloat(item.unitPrice),
              quantity: parseInt(item.quantity),
              ...(item.menuItemId ? { menuItemId: parseInt(item.menuItemId) } : {})
            }
          }
        })
      }
      
      const response = await api.post(endpoint, payload)
      setOrderResult({ success: true, data: response.data })
      
      // Auto-fill pay form with returned orderId
      if (response.data.orderId) {
        setPayForm({ ...payForm, orderId: response.data.orderId })
      }
    } catch (error) {
      setOrderResult({ 
        success: false, 
        error: error.response?.data || { error: error.message } 
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (e) => {
    e.preventDefault()
    setLoading(true)
    setPayResult(null)
    
    try {
      const endpoint = `/student1/${mode}/pay`
      const payload = {
        orderId: parseInt(payForm.orderId),
        paymentMethod: payForm.paymentMethod
      }
      
      const response = await api.post(endpoint, payload)
      setPayResult({ success: true, data: response.data })
    } catch (error) {
      setPayResult({ 
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
      const endpoint = `/student1/${mode}/report`
      const params = new URLSearchParams()
      params.append('restaurantName', reportForm.restaurantName)
      if (reportForm.from) params.append('from', reportForm.from)
      if (reportForm.to) params.append('to', reportForm.to)
      
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
      <h2>Student 1 - Place Order & Pay</h2>
      
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

      {/* Place Order Form */}
      <form onSubmit={handlePlaceOrder}>
        <h3>Place Order</h3>
        
        <div className="form-group">
          <label>Customer Email</label>
          <select
            value={orderForm.customerEmail}
            onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
            required
          >
            <option value="">Select a customer...</option>
            {customers.map(customer => (
              <option key={customer.email} value={customer.email}>
                {customer.name} ({customer.email})
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Restaurant Name</label>
          <select
            value={orderForm.restaurantName}
            onChange={(e) => setOrderForm({ ...orderForm, restaurantName: e.target.value })}
            required
          >
            <option value="">Select a restaurant...</option>
            {restaurants.map(restaurant => (
              <option key={restaurant.name} value={restaurant.name}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>

        <div className="items-list">
          <label>Items</label>
          {orderForm.items.map((item, index) => (
            <div key={index} className="item-row">
              {mode === 'sql' ? (
                <>
                  <select
                    value={item.menuItemId}
                    onChange={(e) => {
                      const selectedItem = menuItems.find(mi => mi.menuItemId === parseInt(e.target.value))
                      handleItemChange(index, 'menuItemId', e.target.value)
                      if (selectedItem) {
                        handleItemChange(index, 'menuItemName', selectedItem.name)
                      }
                    }}
                  >
                    <option value="">Select menu item...</option>
                    {menuItems.map(menuItem => (
                      <option key={menuItem.menuItemId} value={menuItem.menuItemId}>
                        {menuItem.name} (${menuItem.price})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Item name (auto-filled)"
                    value={item.menuItemName}
                    onChange={(e) => handleItemChange(index, 'menuItemName', e.target.value)}
                    readOnly
                  />
                </>
              ) : (
                <>
                  <select
                    value={item.menuItemId}
                    onChange={(e) => {
                      const selectedItem = menuItems.find(mi => mi.menuItemId === parseInt(e.target.value))
                      if (selectedItem) {
                        handleItemChange(index, 'menuItemId', e.target.value)
                        handleItemChange(index, 'name', selectedItem.name)
                        handleItemChange(index, 'unitPrice', selectedItem.price)
                      }
                    }}
                  >
                    <option value="">Select menu item...</option>
                    {menuItems.map(menuItem => (
                      <option key={menuItem.menuItemId} value={menuItem.menuItemId}>
                        {menuItem.name} (${menuItem.price})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Item name (auto-filled)"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    readOnly
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Unit Price (auto-filled)"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                    readOnly
                  />
                </>
              )}
              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                required
                min="1"
              />
              <button type="button" onClick={() => handleRemoveItem(index)}>✕</button>
            </div>
          ))}
          <button type="button" onClick={handleAddItem} className="add-item-btn">
            + Add Item
          </button>
        </div>

        <button type="submit" disabled={loading}>Place Order</button>
      </form>

      {orderResult && (
        <div className={`result ${orderResult.success ? 'success' : 'error'}`}>
          {orderResult.success ? (
            <>
              <div>✓ Order placed! Order ID: {orderResult.data.orderId}</div>
              <pre>{JSON.stringify(orderResult.data, null, 2)}</pre>
            </>
          ) : (
            <>
              <div>✗ Error: {orderResult.error.error}</div>
              {orderResult.error.stack && <pre>{orderResult.error.stack}</pre>}
            </>
          )}
        </div>
      )}

      {/* Pay Order Form */}
      <form onSubmit={handlePay} style={{ marginTop: '30px' }}>
        <h3>Pay Order</h3>
        
        <div className="form-group">
          <label>Order ID</label>
          <input
            type="number"
            value={payForm.orderId}
            onChange={(e) => setPayForm({ ...payForm, orderId: e.target.value })}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Payment Method</label>
          <select
            value={payForm.paymentMethod}
            onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
          >
            <option value="card">Card</option>
            <option value="cash">Cash</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>Pay</button>
      </form>

      {payResult && (
        <div className={`result ${payResult.success ? 'success' : 'error'}`}>
          {payResult.success ? (
            <>
              <div>✓ Payment successful!</div>
              <pre>{JSON.stringify(payResult.data, null, 2)}</pre>
            </>
          ) : (
            <>
              <div>✗ Error: {payResult.error.error}</div>
              {payResult.error.stack && <pre>{payResult.error.stack}</pre>}
            </>
          )}
        </div>
      )}

      {/* Report Form */}
      <form onSubmit={handleReport} style={{ marginTop: '30px' }}>
        <h3>Student 1 Report</h3>
        
        <div className="form-group">
          <label>Restaurant Name (required)</label>
          <select
            value={reportForm.restaurantName}
            onChange={(e) => setReportForm({ ...reportForm, restaurantName: e.target.value })}
            required
          >
            <option value="">Select a restaurant...</option>
            {restaurants.map(restaurant => (
              <option key={restaurant.name} value={restaurant.name}>
                {restaurant.name}
              </option>
            ))}
          </select>
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

export default Student1Section

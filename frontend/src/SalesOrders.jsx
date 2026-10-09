import { useEffect, useState } from "react";

const API_ORDERS = "http://localhost:5000/api/sales-orders";
const API_CUSTOMERS = "http://localhost:5000/api/customers";

export default function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const emptyForm = {
    order_number: "",
    customer_id: "",
    order_date: new Date().toISOString().slice(0, 10),
    total_amount: "",
    status: "Pending",
  };

  const [form, setForm] = useState(emptyForm);

  async function loadData() {
    try {
      setLoading(true);

      const [ordersResponse, customersResponse] = await Promise.all([
        fetch(API_ORDERS),
        fetch(API_CUSTOMERS),
      ]);

      const ordersResult = await ordersResponse.json();
      const customersResult = await customersResponse.json();

      if (!ordersResponse.ok || !ordersResult.success) {
        throw new Error(ordersResult.message || "Could not load orders");
      }

      if (!customersResponse.ok || !customersResult.success) {
        throw new Error(customersResult.message || "Could not load customers");
      }

      setOrders(ordersResult.data || []);
      setCustomers(customersResult.data || []);
      setMessage("");
    } catch (error) {
      setMessage(error.message || "Unable to connect to the backend");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (
      !customers.some(
        (customer) => String(customer.id) === String(form.customer_id),
      )
    ) {
      setMessage("Please select a customer.");
      return;
    }

    try {
      const response = await fetch(
        editingId ? `${API_ORDERS}/${editingId}` : API_ORDERS,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            customer_id: Number(form.customer_id),
            total_amount: Number(form.total_amount),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not save order");
      }

      setMessage(result.message || "Order saved successfully");
      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (error) {
      setMessage(error.message || "Unable to save order");
    }
  }

  function handleEdit(order) {
    setEditingId(order.id);
    setForm({
      order_number: order.order_number || "",
      customer_id: String(order.customer_id || ""),
      order_date: order.order_date
        ? String(order.order_date).slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      total_amount: String(order.total_amount ?? ""),
      status: order.status || "Pending",
    });

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      const response = await fetch(`${API_ORDERS}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not delete order");
      }

      if (String(editingId) === String(id)) {
        setEditingId(null);
        setForm(emptyForm);
      }

      setMessage(result.message || "Order deleted successfully");
      await loadData();
    } catch (error) {
      setMessage(error.message || "Unable to delete order");
    }
  }

  const styles = {
    page: {
      padding: "24px",
      color: "#1f2937",
      fontFamily: "Arial, sans-serif",
    },
    heading: { marginBottom: "6px", fontSize: "28px" },
    subtitle: { color: "#6b7280", marginBottom: "24px" },
    card: {
      background: "#ffffff",
      padding: "22px",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      marginBottom: "24px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
      gap: "16px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: 600,
      marginBottom: "7px",
    },
    input: {
      boxSizing: "border-box",
      width: "100%",
      padding: "11px",
      border: "1px solid #d1d5db",
      borderRadius: "7px",
      background: "#fff",
    },
    primary: {
      padding: "11px 18px",
      border: "none",
      borderRadius: "7px",
      background: "#2563eb",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 600,
    },
    secondary: {
      padding: "11px 18px",
      border: "1px solid #d1d5db",
      borderRadius: "7px",
      background: "#fff",
      cursor: "pointer",
    },
    tableWrap: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", minWidth: "750px" },
    th: {
      padding: "13px",
      textAlign: "left",
      background: "#f3f4f6",
      borderBottom: "1px solid #e5e7eb",
      fontSize: "13px",
    },
    td: {
      padding: "13px",
      borderBottom: "1px solid #e5e7eb",
      fontSize: "14px",
    },
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Sales Orders</h1>
      <p style={styles.subtitle}>
        Create and manage customer orders for your packaging business.
      </p>

      {message && (
        <div
          role="status"
          style={{
            padding: "12px 15px",
            marginBottom: "18px",
            borderRadius: "8px",
            background: /unable|error|invalid|could not|please select/i.test(
              message,
            )
              ? "#fee2e2"
              : "#dcfce7",
            color: /unable|error|invalid|could not|please select/i.test(message)
              ? "#991b1b"
              : "#166534",
          }}
        >
          {message}
        </div>
      )}

      <section style={styles.card}>
        <h2 style={{ marginTop: 0, marginBottom: "20px", fontSize: "20px" }}>
          {editingId ? "Edit Sales Order" : "Create Sales Order"}
        </h2>

        {customers.length === 0 && (
          <p style={{ color: "#b45309" }}>
            No customers found. Add a customer in CRM &amp; Customers first.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.grid}>
            <div>
              <label style={styles.label} htmlFor="order_number">
                Order Number *
              </label>
              <input
                id="order_number"
                name="order_number"
                style={styles.input}
                placeholder="e.g. SO-1001"
                value={form.order_number}
                onChange={handleChange}
                required
                maxLength={50}
              />
            </div>

            <div>
              <label style={styles.label} htmlFor="customer_id">
                Customer *
              </label>
              <select
                id="customer_id"
                name="customer_id"
                style={styles.input}
                value={form.customer_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customer_name}
                    {customer.company_name ? ` — ${customer.company_name}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label} htmlFor="order_date">
                Order Date *
              </label>
              <input
                id="order_date"
                type="date"
                name="order_date"
                style={styles.input}
                value={form.order_date}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={styles.label} htmlFor="total_amount">
                Total Amount (₹) *
              </label>
              <input
                id="total_amount"
                type="number"
                name="total_amount"
                style={styles.input}
                placeholder="Enter total amount"
                min="0"
                step="0.01"
                value={form.total_amount}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={styles.label} htmlFor="status">
                Order Status
              </label>
              <select
                id="status"
                name="status"
                style={styles.input}
                value={form.status}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Production">In Production</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "22px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="submit"
              style={styles.primary}
              disabled={customers.length === 0}
            >
              {editingId ? "Update Order" : "Save Order"}
            </button>

            {editingId && (
              <button
                type="button"
                style={styles.secondary}
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setMessage("");
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section style={styles.card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "18px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px" }}>Orders List</h2>
          <button type="button" style={styles.secondary} onClick={loadData}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading sales orders...</p>
        ) : orders.length === 0 ? (
          <p style={{ color: "#6b7280" }}>
            No sales orders yet. Create your first order above.
          </p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Order No.</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Order Date</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={styles.td}>{order.order_number}</td>
                    <td style={styles.td}>
                      {order.customer_name ||
                        order.company_name ||
                        `Customer #${order.customer_id}`}
                    </td>
                    <td style={styles.td}>
                      {order.order_date
                        ? String(order.order_date).slice(0, 10)
                        : "—"}
                    </td>
                    <td style={styles.td}>
                      ₹
                      {Number(order.total_amount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td style={styles.td}>{order.status}</td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          style={styles.secondary}
                          onClick={() => handleEdit(order)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          style={{
                            ...styles.secondary,
                            color: "#b91c1c",
                            borderColor: "#fecaca",
                          }}
                          onClick={() => handleDelete(order.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

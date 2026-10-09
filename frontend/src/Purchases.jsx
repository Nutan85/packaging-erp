import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/purchases";
const SUPPLIER_API = "http://localhost:5000/api/suppliers";
const PRODUCT_API = "http://localhost:5000/api/purchases/products";

const emptyPurchase = {
  order_number: "",
  supplier_id: "",
  product_id: "",
  order_date: new Date().toISOString().slice(0, 10),
  quantity: "1",
  unit_price: "0",
  status: "Pending",
};

const emptySupplier = {
  supplier_name: "",
  company_name: "",
  phone: "",
  email: "",
  address: "",
};

export default function Purchases() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyPurchase);
  const [supplierForm, setSupplierForm] = useState(emptySupplier);
  const [editingId, setEditingId] = useState(null);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totalAmount =
    (Number(form.quantity) || 0) * (Number(form.unit_price) || 0);

  async function readResponse(response) {
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Request failed");
    }

    return result;
  }

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [orderResponse, supplierResponse, productResponse] =
        await Promise.all([
          fetch(API),
          fetch(SUPPLIER_API),
          fetch(PRODUCT_API),
        ]);

      const [orderResult, supplierResult, productResult] = await Promise.all([
        readResponse(orderResponse),
        readResponse(supplierResponse),
        readResponse(productResponse),
      ]);

      setOrders(orderResult.data || []);
      setSuppliers(supplierResult.data || []);
      setProducts(productResult.data || []);
    } catch (err) {
      setError(err.message || "Could not load purchase data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => {
      const updated = { ...previous, [name]: value };

      if (name === "product_id") {
        const product = products.find(
          (item) => String(item.id) === String(value),
        );

        if (product) {
          updated.unit_price = String(product.unit_price ?? product.price ?? 0);
        }
      }

      return updated;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    if (!suppliers.some((s) => String(s.id) === String(form.supplier_id))) {
      setError("Please select a supplier. Add a supplier first if required.");
      setSaving(false);
      return;
    }

    if (!products.some((p) => String(p.id) === String(form.product_id))) {
      setError("Please select a product.");
      setSaving(false);
      return;
    }

    if (Number(form.quantity) <= 0 || Number(form.unit_price) < 0) {
      setError("Quantity must be positive and unit price cannot be negative.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(editingId ? `${API}/${editingId}` : API, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          supplier_id: Number(form.supplier_id),
          product_id: Number(form.product_id),
          quantity: Number(form.quantity),
          unit_price: Number(form.unit_price),
          total_amount: totalAmount,
        }),
      });

      const result = await readResponse(response);

      setMessage(result.message || "Purchase order saved successfully");
      setForm(emptyPurchase);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to save purchase order");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(order) {
    setEditingId(order.id);
    setForm({
      order_number: order.order_number || "",
      supplier_id: String(order.supplier_id || ""),
      product_id: String(order.product_id || ""),
      order_date: String(order.order_date || "").slice(0, 10),
      quantity: String(order.quantity ?? 1),
      unit_price: String(order.unit_price ?? 0),
      status: order.status || "Pending",
    });

    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (
      !window.confirm("Are you sure you want to delete this purchase order?")
    ) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const result = await readResponse(
        await fetch(`${API}/${id}`, { method: "DELETE" }),
      );

      if (String(editingId) === String(id)) {
        setEditingId(null);
        setForm(emptyPurchase);
      }

      setMessage(result.message || "Purchase order deleted");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddSupplier(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const result = await readResponse(
        await fetch(SUPPLIER_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(supplierForm),
        }),
      );

      setMessage(result.message || "Supplier added successfully");
      setSupplierForm(emptySupplier);
      setShowSupplierForm(false);
      await loadData();

      if (result.id) {
        setForm((previous) => ({
          ...previous,
          supplier_id: String(result.id),
        }));
      }
    } catch (err) {
      setError(err.message || "Could not add supplier");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyPurchase);
    setMessage("");
    setError("");
  }

  const styles = {
    page: {
      padding: "28px",
      color: "#1e293b",
      fontFamily: "Arial, sans-serif",
      background: "#f6f8fc",
      minHeight: "100vh",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "12px",
      marginBottom: "24px",
    },
    title: { margin: "0 0 8px", fontSize: "28px" },
    muted: { color: "#64748b", margin: 0 },
    button: {
      padding: "10px 16px",
      border: "none",
      borderRadius: "7px",
      background: "#2563eb",
      color: "white",
      cursor: "pointer",
      fontWeight: 600,
    },
    secondary: {
      padding: "10px 14px",
      border: "1px solid #cbd5e1",
      borderRadius: "7px",
      background: "white",
      color: "#334155",
      cursor: "pointer",
    },
    panel: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "22px",
      marginBottom: "22px",
      boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "16px",
    },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: 600,
      marginBottom: "7px",
      color: "#475569",
    },
    input: {
      boxSizing: "border-box",
      width: "100%",
      padding: "11px",
      border: "1px solid #cbd5e1",
      borderRadius: "7px",
      background: "white",
      color: "#0f172a",
    },
    field: { marginBottom: "16px" },
    tableWrap: { overflowX: "auto" },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "850px",
    },
    th: {
      textAlign: "left",
      padding: "13px 12px",
      background: "#f8fafc",
      color: "#64748b",
      fontSize: "12px",
      borderBottom: "1px solid #e2e8f0",
    },
    td: {
      padding: "14px 12px",
      borderBottom: "1px solid #e2e8f0",
      fontSize: "13px",
    },
    alert: {
      padding: "12px 15px",
      borderRadius: "8px",
      marginBottom: "16px",
    },
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={{ ...styles.muted, fontSize: "12px", marginBottom: "8px" }}>
            WORKSPACE / PROCUREMENT
          </p>
          <h1 style={styles.title}>Purchase Management</h1>
          <p style={styles.muted}>
            Manage suppliers, purchase orders and procurement costs.
          </p>
        </div>

        <button type="button" style={styles.secondary} onClick={loadData}>
          ↻ Refresh
        </button>
      </header>

      <div style={styles.grid}>
        <div style={styles.panel}>
          <p style={styles.muted}>Total Purchase Orders</p>
          <h2>{orders.length}</h2>
        </div>
        <div style={styles.panel}>
          <p style={styles.muted}>Total Suppliers</p>
          <h2>{suppliers.length}</h2>
        </div>
        <div style={styles.panel}>
          <p style={styles.muted}>Total Purchase Value</p>
          <h2>
            ₹
            {orders
              .reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
              .toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

      {error && (
        <div
          style={{ ...styles.alert, background: "#fee2e2", color: "#991b1b" }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          style={{ ...styles.alert, background: "#dcfce7", color: "#166534" }}
        >
          {message}
        </div>
      )}

      <section style={styles.panel}>
        <div style={styles.header}>
          <div>
            <h2 style={{ margin: "0 0 6px" }}>
              {editingId ? "Edit Purchase Order" : "Create Purchase Order"}
            </h2>
            <p style={styles.muted}>Fill in the details below.</p>
          </div>

          <button
            type="button"
            style={styles.secondary}
            onClick={() => setShowSupplierForm(!showSupplierForm)}
          >
            {showSupplierForm ? "Close Supplier Form" : "+ Add Supplier"}
          </button>
        </div>

        {showSupplierForm && (
          <form
            onSubmit={handleAddSupplier}
            style={{
              background: "#f8fafc",
              padding: "18px",
              borderRadius: "10px",
              marginBottom: "22px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>New Supplier</h3>

            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Supplier Name *</label>
                <input
                  style={styles.input}
                  required
                  value={supplierForm.supplier_name}
                  onChange={(e) =>
                    setSupplierForm({
                      ...supplierForm,
                      supplier_name: e.target.value,
                    })
                  }
                  placeholder="Supplier name"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Company Name</label>
                <input
                  style={styles.input}
                  value={supplierForm.company_name}
                  onChange={(e) =>
                    setSupplierForm({
                      ...supplierForm,
                      company_name: e.target.value,
                    })
                  }
                  placeholder="Company name"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Phone</label>
                <input
                  style={styles.input}
                  value={supplierForm.phone}
                  onChange={(e) =>
                    setSupplierForm({
                      ...supplierForm,
                      phone: e.target.value,
                    })
                  }
                  placeholder="Phone number"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input
                  style={styles.input}
                  type="email"
                  value={supplierForm.email}
                  onChange={(e) =>
                    setSupplierForm({
                      ...supplierForm,
                      email: e.target.value,
                    })
                  }
                  placeholder="Email address"
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Address</label>
              <input
                style={styles.input}
                value={supplierForm.address}
                onChange={(e) =>
                  setSupplierForm({
                    ...supplierForm,
                    address: e.target.value,
                  })
                }
                placeholder="Supplier address"
              />
            </div>

            <button type="submit" style={styles.button}>
              Save Supplier
            </button>
          </form>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.grid}>
            <div style={styles.field}>
              <label style={styles.label}>Purchase Order Number *</label>
              <input
                style={styles.input}
                name="order_number"
                value={form.order_number}
                onChange={handleChange}
                placeholder="e.g. PO-1001"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Supplier *</label>
              <select
                style={styles.input}
                name="supplier_id"
                value={form.supplier_id}
                onChange={handleChange}
                required
              >
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.supplier_name}
                    {supplier.company_name ? ` - ${supplier.company_name}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Product *</label>
              <select
                style={styles.input}
                name="product_id"
                value={form.product_id}
                onChange={handleChange}
                required
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.product_name}
                    {product.product_code ? ` (${product.product_code})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Order Date *</label>
              <input
                style={styles.input}
                type="date"
                name="order_date"
                value={form.order_date}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Quantity *</label>
              <input
                style={styles.input}
                type="number"
                min="1"
                step="1"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Unit Price (₹) *</label>
              <input
                style={styles.input}
                type="number"
                min="0"
                step="0.01"
                name="unit_price"
                value={form.unit_price}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Total Amount (₹)</label>
              <input
                style={{ ...styles.input, background: "#f1f5f9" }}
                value={totalAmount.toFixed(2)}
                readOnly
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Purchase Status</label>
              <select
                style={styles.input}
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="Ordered">Ordered</option>
                <option value="Received">Received</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button type="submit" style={styles.button} disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Purchase Order"
                  : "Save Purchase Order"}
            </button>

            {editingId && (
              <button
                type="button"
                style={styles.secondary}
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section style={styles.panel}>
        <h2 style={{ marginTop: 0 }}>Purchase Orders</h2>

        {loading ? (
          <p>Loading purchase orders...</p>
        ) : orders.length === 0 ? (
          <p style={styles.muted}>
            No purchase orders found. Create one above.
          </p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {[
                    "Order No.",
                    "Supplier",
                    "Product",
                    "Date",
                    "Quantity",
                    "Unit Price",
                    "Total",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th key={heading} style={styles.th}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={styles.td}>{order.order_number}</td>
                    <td style={styles.td}>
                      {order.supplier_name || order.company_name || "—"}
                    </td>
                    <td style={styles.td}>{order.product_name || "—"}</td>
                    <td style={styles.td}>
                      {String(order.order_date || "").slice(0, 10)}
                    </td>
                    <td style={styles.td}>{order.quantity}</td>
                    <td style={styles.td}>
                      ₹{Number(order.unit_price || 0).toFixed(2)}
                    </td>
                    <td style={styles.td}>
                      ₹{Number(order.total_amount || 0).toFixed(2)}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          background:
                            order.status === "Received"
                              ? "#dcfce7"
                              : order.status === "Cancelled"
                                ? "#fee2e2"
                                : "#fef3c7",
                          color:
                            order.status === "Received"
                              ? "#166534"
                              : order.status === "Cancelled"
                                ? "#991b1b"
                                : "#92400e",
                          borderRadius: "20px",
                          padding: "5px 9px",
                          fontSize: "12px",
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: "7px" }}>
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

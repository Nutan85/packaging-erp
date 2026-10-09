import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/products";

const emptyForm = {
  product_name: "",
  product_code: "",
  category: "",
  price: "",
  stock_quantity: "",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load products");
      }

      setProducts(result.data);
    } catch (err) {
      setError(`Could not load products: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
            stock_quantity: Number(form.stock_quantity),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save product");
      }

      setMessage(result.message);
      setForm(emptyForm);
      setEditingId(null);
      await loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(product) {
    setForm({
      product_name: product.product_name || "",
      product_code: product.product_code || "",
      category: product.category || "",
      price: String(product.price ?? ""),
      stock_quantity: String(product.stock_quantity ?? ""),
    });

    setEditingId(product.id);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete product");
      }

      setMessage(result.message);

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>PACKAGING INDUSTRY ERP</p>
          <h1 style={styles.title}>Product & Inventory Management</h1>
          <p style={styles.subtitle}>
            Manage packaging products, prices and available stock.
          </p>
        </div>

        <div style={styles.counter}>
          <span>Total Products</span>
          <strong>{products.length}</strong>
        </div>
      </header>

      {error && <div style={styles.error}>{error}</div>}
      {message && <div style={styles.success}>{message}</div>}

      <section style={styles.panel}>
        <h2 style={styles.heading}>
          {editingId ? "Update Product" : "Add New Product"}
        </h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="product_name">Product Name *</label>
            <input
              id="product_name"
              name="product_name"
              value={form.product_name}
              onChange={handleChange}
              placeholder="e.g. Corrugated Box"
              required
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="product_code">Product Code</label>
            <input
              id="product_code"
              name="product_code"
              value={form.product_code}
              onChange={handleChange}
              placeholder="e.g. PKG-001"
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="category">Category</label>
            <input
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Cartons"
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="price">Price (₹) *</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="stock_quantity">Stock Quantity *</label>
            <input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              min="0"
              step="1"
              value={form.stock_quantity}
              onChange={handleChange}
              placeholder="e.g. 100"
              required
            />
          </div>

          <div style={styles.actions}>
            <button
              type="submit"
              disabled={saving}
              style={styles.primaryButton}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Product"
                  : "Save Product"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section style={styles.panel}>
        <div style={styles.tableHeader}>
          <h2 style={styles.heading}>Product Inventory</h2>
          <button
            type="button"
            onClick={loadProducts}
            style={styles.refreshButton}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p style={styles.empty}>Loading products...</p>
        ) : products.length === 0 ? (
          <p style={styles.empty}>
            No products available. Add your first product above.
          </p>
        ) : (
          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Code</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Stock</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td style={styles.td}>{product.product_name}</td>
                    <td style={styles.td}>{product.product_code || "—"}</td>
                    <td style={styles.td}>{product.category || "—"}</td>
                    <td style={styles.td}>
                      ₹{Number(product.price).toFixed(2)}
                    </td>
                    <td style={styles.td}>{product.stock_quantity}</td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          style={styles.editButton}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          style={styles.deleteButton}
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

        <p style={styles.footer}>{products.length} product record(s)</p>
      </section>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 1250,
    margin: "0 auto",
    padding: "28px",
    color: "#1d2b42",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 20,
    marginBottom: 25,
  },
  eyebrow: {
    color: "#3978d5",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 28,
    margin: "8px 0",
  },
  subtitle: {
    color: "#78869b",
    fontSize: 14,
  },
  counter: {
    background: "#eaf2ff",
    padding: "18px 25px",
    borderRadius: 12,
    minWidth: 140,
  },
  panel: {
    background: "#ffffff",
    border: "1px solid #e4eaf2",
    borderRadius: 12,
    padding: 24,
    marginBottom: 22,
    boxShadow: "0 4px 15px rgba(20, 40, 70, 0.04)",
  },
  heading: {
    fontSize: 18,
    margin: "0 0 20px",
  },
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 18,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
  },
  input: {
    padding: 12,
    border: "1px solid #dce3ed",
    borderRadius: 7,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  primaryButton: {
    background: "#3477df",
    color: "#ffffff",
    border: 0,
    borderRadius: 7,
    padding: "12px 18px",
    fontWeight: 600,
    cursor: "pointer",
    alignSelf: "end",
  },
  cancelButton: {
    background: "#edf1f7",
    color: "#334155",
    border: 0,
    borderRadius: 7,
    padding: "12px 18px",
    cursor: "pointer",
    alignSelf: "end",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  refreshButton: {
    background: "#edf4ff",
    color: "#2e68bd",
    border: "1px solid #d9e8ff",
    borderRadius: 7,
    padding: "9px 13px",
    cursor: "pointer",
  },
  tableScroll: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: 13,
  },
  th: {
    background: "#f5f8fc",
    color: "#61718a",
    padding: 13,
    whiteSpace: "nowrap",
  },
  td: {
    borderBottom: "1px solid #edf0f5",
    padding: 13,
  },
  editButton: {
    background: "#edf4ff",
    color: "#2e68bd",
    border: "1px solid #d9e8ff",
    borderRadius: 5,
    padding: "7px 10px",
    cursor: "pointer",
  },
  deleteButton: {
    background: "#fff0f0",
    color: "#c34242",
    border: "1px solid #ffdddd",
    borderRadius: 5,
    padding: "7px 10px",
    cursor: "pointer",
  },
  empty: {
    padding: 35,
    textAlign: "center",
    color: "#7c899b",
  },
  footer: {
    borderTop: "1px solid #edf0f5",
    margin: "18px -24px -24px",
    padding: 16,
    color: "#7c899b",
    fontSize: 12,
  },
  error: {
    padding: 12,
    marginBottom: 15,
    color: "#a12626",
    background: "#fff0f0",
    borderRadius: 7,
  },
  success: {
    padding: 12,
    marginBottom: 15,
    color: "#126b4c",
    background: "#eafaf2",
    borderRadius: 7,
  },
};

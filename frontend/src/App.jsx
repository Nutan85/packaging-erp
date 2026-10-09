import { useEffect, useState } from "react";
import "./App.css";
import Products from "./Products";
import SalesOrders from "./SalesOrders";
import Purchases from "./Purchases";

const API_URL = "http://localhost:5000/api/customers";

const emptyForm = {
  customer_name: "",
  company_name: "",
  phone: "",
  email: "",
  address: "",
};

function App() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeModule, setActiveModule] = useState("customers");

  async function loadCustomers() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load customers");
      }

      setCustomers(result.data || []);
    } catch (err) {
      setError(`Could not connect to backend. ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save customer");
      }

      setMessage(result.message || "Customer saved successfully");
      setForm(emptyForm);
      setEditingId(null);

      await loadCustomers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(customer) {
    setForm({
      customer_name: customer.customer_name || "",
      company_name: customer.company_name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
    });

    setEditingId(customer.id);
    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this customer?")) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete customer");
      }

      setMessage(result.message || "Customer deleted successfully");

      if (String(editingId) === String(id)) {
        setEditingId(null);
        setForm(emptyForm);
      }

      await loadCustomers();
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

  function selectModule(module) {
    setActiveModule(module);
    setError("");
    setMessage("");
  }

  return (
    <div className="erp-app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">P</div>
          <div>
            <h2>PackERP</h2>
            <span>Industry Management</span>
          </div>
        </div>

        <p className="nav-heading">WORKSPACE</p>

        {/* CRM & Customers */}
        <div
          className={`nav-item ${activeModule === "customers" ? "active" : ""}`}
          onClick={() => selectModule("customers")}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              selectModule("customers");
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <span>▦</span> CRM &amp; Customers
        </div>

        {/* Sales & Orders */}
        <div
          className={`nav-item ${activeModule === "sales" ? "active" : ""}`}
          onClick={() => selectModule("sales")}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              selectModule("sales");
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <span>▤</span> Sales &amp; Orders
        </div>

        {/* Inventory */}
        <div
          className={`nav-item ${activeModule === "products" ? "active" : ""}`}
          onClick={() => selectModule("products")}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              selectModule("products");
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <span>▧</span> Inventory
        </div>

        {/* Purchases */}
        <div
          className={`nav-item ${activeModule === "purchases" ? "active" : ""}`}
          onClick={() => selectModule("purchases")}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              selectModule("purchases");
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <span>⇄</span> Purchases
        </div>

        <div className="sidebar-bottom">
          <div className="status-dot"></div>
          <div>
            <strong>System Status</strong>
            <small>ERP Workspace</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {/* CRM MODULE */}
        {activeModule === "customers" ? (
          <>
            <header className="topbar">
              <div>
                <span className="breadcrumb">Workspace / CRM</span>
                <h1>Customer Management</h1>
              </div>
              <div className="topbar-label">PACKAGING INDUSTRY ERP</div>
            </header>

            <section className="welcome-banner">
              <div>
                <span className="eyebrow">
                  CUSTOMER RELATIONSHIP MANAGEMENT
                </span>
                <h2>Manage your customers</h2>
                <p>Keep customer details organised in one place.</p>
              </div>
              <div className="banner-symbol">CRM</div>
            </section>

            <section className="stats-grid">
              <div className="stat-card">
                <span>Total Customers</span>
                <strong>{customers.length}</strong>
                <small>Customers in database</small>
              </div>

              <div className="stat-card">
                <span>Customer Records</span>
                <strong>{loading ? "..." : customers.length}</strong>
                <small>Live database records</small>
              </div>

              <div className="stat-card">
                <span>Module Status</span>
                <strong className="status-text">Active</strong>
                <small>CRM module</small>
              </div>
            </section>

            {error && <div className="alert error-alert">{error}</div>}

            {message && <div className="alert success-alert">{message}</div>}

            <section className="content-grid">
              {/* Customer Form */}
              <div className="panel form-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-kicker">
                      {editingId ? "UPDATE RECORD" : "NEW RECORD"}
                    </span>
                    <h2>{editingId ? "Edit Customer" : "Add Customer"}</h2>
                  </div>
                  <span className="panel-icon">＋</span>
                </div>

                <form onSubmit={handleSubmit}>
                  <label htmlFor="customer_name">Customer Name *</label>
                  <input
                    id="customer_name"
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="Enter customer name"
                    required
                  />

                  <label htmlFor="company_name">Company Name</label>
                  <input
                    id="company_name"
                    name="company_name"
                    value={form.company_name}
                    onChange={handleChange}
                    placeholder="Enter company name"
                  />

                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />

                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />

                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                    rows="3"
                  />

                  <button
                    className="primary-button"
                    type="submit"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update Customer"
                        : "Save Customer"}
                  </button>

                  {editingId && (
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={cancelEdit}
                    >
                      Cancel Edit
                    </button>
                  )}
                </form>
              </div>

              {/* Customer List */}
              <div className="panel table-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-kicker">CUSTOMER DIRECTORY</span>
                    <h2>All Customers</h2>
                  </div>

                  <button
                    className="refresh-button"
                    onClick={loadCustomers}
                    type="button"
                  >
                    ↻ Refresh
                  </button>
                </div>

                {loading ? (
                  <p className="empty-state">Loading customers...</p>
                ) : customers.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">▤</div>
                    <strong>No customers yet</strong>
                    <p>Add your first customer using the form.</p>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Company</th>
                          <th>Contact</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {customers.map((customer) => (
                          <tr key={customer.id}>
                            <td>
                              <strong>{customer.customer_name}</strong>
                              <small className="record-id">
                                ID: {customer.id}
                              </small>
                            </td>

                            <td>{customer.company_name || "—"}</td>

                            <td>
                              <span>{customer.phone || "—"}</span>
                              <small>{customer.email || ""}</small>
                            </td>

                            <td>
                              <div className="action-buttons">
                                <button
                                  className="edit-button"
                                  onClick={() => handleEdit(customer)}
                                  type="button"
                                >
                                  Edit
                                </button>

                                <button
                                  className="delete-button"
                                  onClick={() => handleDelete(customer.id)}
                                  type="button"
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

                <div className="table-footer">
                  Showing {customers.length} customer record(s)
                </div>
              </div>
            </section>

            <footer className="footer">
              Packaging Industry ERP Management System
              <span>•</span> CRM Module
            </footer>
          </>
        ) : activeModule === "products" ? (
          /* INVENTORY MODULE */
          <Products />
        ) : activeModule === "sales" ? (
          /* SALES ORDERS MODULE */
          <SalesOrders />
        ) : (
          /* PURCHASE MODULE */
          <Purchases />
        )}
      </main>
    </div>
  );
}

export default App;

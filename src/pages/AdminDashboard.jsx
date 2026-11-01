import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getTempleImage, DEFAULT_IMAGE } from "../utils_templeImages";

const emptyTempleForm = {
  name: "",
  location: "",
  state: "",
  city: "",
  description: "",
  history: "",
  timings: "",
  address: "",
  image: "",
  darshanTypes: "",
  poojaTypes: "",
};

const emptySlotForm = {
  temple: "",
  date: "",
  startTime: "",
  endTime: "",
  darshanType: "",
  capacity: "",
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const [stats, setStats] = useState(null);
  const [temples, setTemples] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [templeForm, setTempleForm] = useState(emptyTempleForm);
  const [editingTempleId, setEditingTempleId] = useState("");

  const [slotForm, setSlotForm] = useState(emptySlotForm);
  const [editingSlotId, setEditingSlotId] = useState("");

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, templesRes, slotsRes, bookingsRes, usersRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/temples"),
        api.get("/slots"),
        api.get("/admin/bookings"),
        api.get("/admin/users"),
      ]);
      setStats(statsRes.data);
      setTemples(templesRes.data);
      setSlots(slotsRes.data);
      setBookings(bookingsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setMessage("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ---------- Temple management ----------
  const handleTempleFormChange = (e) => {
    setTempleForm({ ...templeForm, [e.target.name]: e.target.value });
  };

  const startEditTemple = (temple) => {
    setEditingTempleId(temple._id);
    setTempleForm({
      name: temple.name || "",
      location: temple.location || "",
      state: temple.state || "",
      city: temple.city || "",
      description: temple.description || "",
      history: temple.history || "",
      timings: temple.timings || "",
      address: temple.address || "",
      image: temple.image || "",
      darshanTypes: (temple.darshanTypes || []).join(", "),
      poojaTypes: (temple.poojaTypes || []).join(", "),
    });
    setActiveTab("temples");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetTempleForm = () => {
    setEditingTempleId("");
    setTempleForm(emptyTempleForm);
  };

  const submitTempleForm = async (e) => {
    e.preventDefault();
    setMessage("");
    const payload = {
      ...templeForm,
      darshanTypes: templeForm.darshanTypes
        ? templeForm.darshanTypes.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      poojaTypes: templeForm.poojaTypes
        ? templeForm.poojaTypes.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };
    try {
      if (editingTempleId) {
        await api.put(`/temples/${editingTempleId}`, payload);
        setMessage("Temple updated successfully.");
      } else {
        await api.post("/temples", payload);
        setMessage("Temple added successfully.");
      }
      resetTempleForm();
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save temple.");
    }
  };

  const deleteTemple = async (id) => {
    if (!window.confirm("Delete this temple? This cannot be undone.")) return;
    try {
      await api.delete(`/temples/${id}`);
      setMessage("Temple deleted.");
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete temple.");
    }
  };

  // ---------- Slot management ----------
  const handleSlotFormChange = (e) => {
    setSlotForm({ ...slotForm, [e.target.name]: e.target.value });
  };

  const startEditSlot = (slot) => {
    setEditingSlotId(slot._id);
    setSlotForm({
      temple: slot.temple?._id || slot.temple,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      darshanType: slot.darshanType,
      capacity: slot.capacity,
    });
    setActiveTab("slots");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetSlotForm = () => {
    setEditingSlotId("");
    setSlotForm(emptySlotForm);
  };

  const submitSlotForm = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (editingSlotId) {
        await api.put(`/slots/${editingSlotId}`, slotForm);
        setMessage("Slot updated successfully.");
      } else {
        await api.post("/slots", slotForm);
        setMessage("Slot added successfully.");
      }
      resetSlotForm();
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save slot.");
    }
  };

  const deleteSlot = async (id) => {
    if (!window.confirm("Delete this slot?")) return;
    try {
      await api.delete(`/slots/${id}`);
      setMessage("Slot deleted.");
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete slot.");
    }
  };

  if (loading) return <p className="info-text">Loading...</p>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage temples, slots, bookings and users for Divine Darshan.</p>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="admin-tabs">
        {["overview", "temples", "slots", "bookings", "users"].map((tab) => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "overview" && "Overview"}
            {tab === "temples" && "Manage Temples"}
            {tab === "slots" && "Manage Slots"}
            {tab === "bookings" && "Manage Bookings"}
            {tab === "users" && "Manage Users"}
          </button>
        ))}
      </div>

      {activeTab === "overview" && stats && (
        <div className="stats-grid">
          <div className="stat-card"><h3>{stats.totalUsers}</h3><p>Total Users</p></div>
          <div className="stat-card"><h3>{stats.totalTemples}</h3><p>Total Temples</p></div>
          <div className="stat-card"><h3>{stats.totalBookings}</h3><p>Total Bookings</p></div>
          <div className="stat-card"><h3>{stats.todaysBookings}</h3><p>Today's Bookings</p></div>
          <div className="stat-card"><h3>{stats.confirmedBookings}</h3><p>Confirmed Bookings</p></div>
          <div className="stat-card"><h3>{stats.cancelledBookings}</h3><p>Cancelled Bookings</p></div>
        </div>
      )}

      {activeTab === "temples" && (
        <div className="admin-section">
          <h2>{editingTempleId ? "Edit Temple" : "Add Temple"}</h2>
          <form className="admin-form" onSubmit={submitTempleForm}>
            <div className="form-row">
              <div>
                <label>Temple Name</label>
                <input name="name" value={templeForm.name} onChange={handleTempleFormChange} required />
              </div>
              <div>
                <label>Location (area)</label>
                <input name="location" value={templeForm.location} onChange={handleTempleFormChange} />
              </div>
            </div>
            <div className="form-row">
              <div>
                <label>City</label>
                <input name="city" value={templeForm.city} onChange={handleTempleFormChange} required />
              </div>
              <div>
                <label>State</label>
                <input name="state" value={templeForm.state} onChange={handleTempleFormChange} required />
              </div>
            </div>
            <label>Image URL</label>
            <input name="image" value={templeForm.image} onChange={handleTempleFormChange} placeholder="https://..." />

            <label>Description</label>
            <textarea name="description" value={templeForm.description} onChange={handleTempleFormChange} rows={2} />

            <label>History</label>
            <textarea name="history" value={templeForm.history} onChange={handleTempleFormChange} rows={2} />

            <div className="form-row">
              <div>
                <label>Timings</label>
                <input name="timings" value={templeForm.timings} onChange={handleTempleFormChange} placeholder="6:00 AM - 8:00 PM" />
              </div>
              <div>
                <label>Address</label>
                <input name="address" value={templeForm.address} onChange={handleTempleFormChange} />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>Darshan Types (comma separated)</label>
                <input name="darshanTypes" value={templeForm.darshanTypes} onChange={handleTempleFormChange} placeholder="General Darshan, Special Darshan" />
              </div>
              <div>
                <label>Pooja Types (comma separated)</label>
                <input name="poojaTypes" value={templeForm.poojaTypes} onChange={handleTempleFormChange} placeholder="Abhishekam, Archana" />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-solid">
                {editingTempleId ? "Update Temple" : "Add Temple"}
              </button>
              {editingTempleId && (
                <button type="button" className="btn btn-outline" onClick={resetTempleForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <h2>All Temples ({temples.length})</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {temples.map((temple) => (
                  <tr key={temple._id}>
                    <td>
                      <img
                        className="admin-thumb"
                        src={getTempleImage(temple)}
                        alt={temple.name}
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_IMAGE; }}
                      />
                    </td>
                    <td>{temple.name}</td>
                    <td>{temple.city}</td>
                    <td>{temple.state}</td>
                    <td className="admin-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => startEditTemple(temple)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteTemple(temple._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "slots" && (
        <div className="admin-section">
          <h2>{editingSlotId ? "Edit Slot" : "Add Slot"}</h2>
          <form className="admin-form" onSubmit={submitSlotForm}>
            <label>Temple</label>
            <select name="temple" value={slotForm.temple} onChange={handleSlotFormChange} required>
              <option value="">Select a temple</option>
              {temples.map((t) => (
                <option key={t._id} value={t._id}>{t.name} — {t.city}</option>
              ))}
            </select>

            <div className="form-row">
              <div>
                <label>Date</label>
                <input type="date" name="date" value={slotForm.date} onChange={handleSlotFormChange} required />
              </div>
              <div>
                <label>Darshan/Pooja Type</label>
                <input name="darshanType" value={slotForm.darshanType} onChange={handleSlotFormChange} placeholder="General Darshan" required />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>Start Time</label>
                <input name="startTime" value={slotForm.startTime} onChange={handleSlotFormChange} placeholder="09:00 AM" required />
              </div>
              <div>
                <label>End Time</label>
                <input name="endTime" value={slotForm.endTime} onChange={handleSlotFormChange} placeholder="10:00 AM" required />
              </div>
            </div>

            <label>Capacity</label>
            <input type="number" min="1" name="capacity" value={slotForm.capacity} onChange={handleSlotFormChange} required />

            <div className="form-actions">
              <button type="submit" className="btn btn-solid">
                {editingSlotId ? "Update Slot" : "Add Slot"}
              </button>
              {editingSlotId && (
                <button type="button" className="btn btn-outline" onClick={resetSlotForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <h2>All Slots ({slots.length})</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Temple</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Booked</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={slot._id}>
                    <td>{slot.temple?.name || "-"}</td>
                    <td>{slot.date}</td>
                    <td>{slot.startTime} – {slot.endTime}</td>
                    <td>{slot.darshanType}</td>
                    <td>{slot.capacity}</td>
                    <td>{slot.bookedSeats}</td>
                    <td className="admin-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => startEditSlot(slot)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteSlot(slot._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="admin-section">
          <h2>All Bookings ({bookings.length})</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Booking ID</th>
                  <th>User</th>
                  <th>Temple</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Devotees</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <img
                        className="admin-thumb"
                        src={getTempleImage(booking.temple)}
                        alt={booking.temple?.name}
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_IMAGE; }}
                      />
                    </td>
                    <td>{booking.bookingId}</td>
                    <td>{booking.user?.name || "-"}</td>
                    <td>{booking.temple?.name || "-"}</td>
                    <td>{booking.bookingDate}</td>
                    <td>{booking.darshanType}</td>
                    <td>{booking.numberOfDevotees}</td>
                    <td>
                      <span className={`status-badge ${booking.status === "CANCELLED" ? "status-cancelled" : "status-confirmed"}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="admin-section">
          <h2>All Users ({users.length})</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name} {u._id === user?._id && "(You)"}</td>
                    <td>{u.email}</td>
                    <td>{u.mobile}</td>
                    <td>{u.role}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

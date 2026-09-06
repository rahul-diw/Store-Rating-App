import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");

  const [stores, setStores] = useState([]);
  const [storeSearch, setStoreSearch] = useState("");
  const [storesLoading, setStoresLoading] = useState(true);
  const [storesError, setStoresError] = useState("");

  const [showCreateStoreModal, setShowCreateStoreModal] = useState(false);
  const [storeOwners, setStoreOwners] = useState([]);
  const [createStoreLoading, setCreateStoreLoading] = useState(false);
  const [createStoreError, setCreateStoreError] = useState("");
  const [createStoreSuccess, setCreateStoreSuccess] = useState("");

  const [createStoreForm, setCreateStoreForm] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });

  // ==============================
  // CREATE USER STATE
  // ==============================
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    role: "user",
  });

  // ==============================
  // EDIT USER STATE
  // ==============================
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
    password: "",
  });

  // ==============================
  // FETCH DASHBOARD
  // ==============================
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setStatsLoading(true);
      setError("");

      const [statsResponse, usersResponse, storesResponse, ownersResponse] =
        await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/users"),
          api.get("/stores"),
          api.get("/admin/users?role=store_owner"),
        ]);

      const storesData = storesResponse.data;

      if (Array.isArray(storesData?.stores)) {
        setStores(storesData.stores);
      } else {
        setStores([]);
      }

      const ownersData = ownersResponse.data;

      if (Array.isArray(ownersData?.users)) {
        setStoreOwners(ownersData.users);
      } else {
        setStoreOwners([]);
      }

      const statsData = statsResponse.data;
      const usersData = usersResponse.data;

      if (statsData?.data) {
        setStats({
          totalUsers: Number(statsData.data.totalUsers || 0),
          totalStores: Number(statsData.data.totalStores || 0),
          totalRatings: Number(statsData.data.totalRatings || 0),
        });
      }

      if (Array.isArray(usersData?.users)) {
        setUsers(usersData.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Admin dashboard error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load admin dashboard. Please try again.",
      );
    } finally {
      setLoading(false);
      setStatsLoading(false);
      setStoresLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ==============================
  // FILTER USERS
  // ==============================
  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const name = item.name || "";
      const email = item.email || "";
      const userRole = item.role || "";

      const searchValue = search.toLowerCase();

      const matchesSearch =
        name.toLowerCase().includes(searchValue) ||
        email.toLowerCase().includes(searchValue);

      const matchesRole = role === "" || userRole === role;

      return matchesSearch && matchesRole;
    });
  }, [users, search, role]);

  // ==============================
  // FILTER STORES
  // ==============================
  const filteredStores = useMemo(() => {
    const searchValue = storeSearch.toLowerCase();

    return stores.filter((store) => {
      const name = store.name || "";
      const email = store.email || "";
      const address = store.address || "";
      const ownerName = store.owner_name || "";

      return (
        name.toLowerCase().includes(searchValue) ||
        email.toLowerCase().includes(searchValue) ||
        address.toLowerCase().includes(searchValue) ||
        ownerName.toLowerCase().includes(searchValue)
      );
    });
  }, [stores, storeSearch]);

  // ==============================
  // HELPERS
  // ==============================
  const getInitial = (name = "U") => {
    return name.charAt(0).toUpperCase();
  };

  const formatRole = (value) => {
    if (value === "store_owner") return "Store Owner";
    if (value === "admin") return "Admin";
    return "Customer";
  };

  // ==============================
  // LOGOUT
  // ==============================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  // ==============================
  // OPEN EDIT MODAL
  // ==============================
  const openEditModal = (item) => {
    setSelectedUser(item);

    setEditForm({
      name: item.name || "",
      email: item.email || "",
      address: item.address || "",
      role: item.role || "user",
      password: "",
    });

    setEditError("");
    setEditSuccess("");
    setShowEditModal(true);
  };

  // ==============================
  // CLOSE EDIT MODAL
  // ==============================
  const closeEditModal = () => {
    if (editLoading) return;

    setShowEditModal(false);
    setSelectedUser(null);
    setEditError("");
    setEditSuccess("");

    setEditForm({
      name: "",
      email: "",
      address: "",
      role: "",
      password: "",
    });
  };

  // ==============================
  // HANDLE EDIT INPUT
  // ==============================
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==============================
  // UPDATE USER
  // ==============================
  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!selectedUser) return;

    try {
      setEditLoading(true);
      setEditError("");
      setEditSuccess("");

      const payload = {
        name: editForm.name,
        email: editForm.email,
        address: editForm.address,
        role: editForm.role,
      };

      // Password only goes to backend if entered
      if (editForm.password.trim()) {
        payload.password = editForm.password;
      }

      const response = await api.put(
        `/admin/users/${selectedUser.id}`,
        payload,
      );

      if (response.data?.success) {
        setEditSuccess(response.data.message || "User updated successfully.");

        // Refresh users + statistics
        await fetchDashboard();

        // Small delay so success message is visible
        setTimeout(() => {
          closeEditModal();
        }, 700);
      } else {
        setEditError(response.data?.message || "Unable to update user.");
      }
    } catch (err) {
      console.error("Update user error:", err);

      setEditError(
        err.response?.data?.message ||
          "Something went wrong while updating the user.",
      );
    } finally {
      setEditLoading(false);
    }
  };

  // ==============================
  // OPEN CREATE MODAL
  // ==============================
  const openCreateModal = () => {
    setCreateForm({
      name: "",
      email: "",
      address: "",
      password: "",
      role: "user",
    });

    setCreateError("");
    setCreateSuccess("");
    setShowCreateModal(true);
  };

  // ==============================
  // CLOSE CREATE MODAL
  // ==============================
  const closeCreateModal = () => {
    if (createLoading) return;

    setShowCreateModal(false);
    setCreateError("");
    setCreateSuccess("");

    setCreateForm({
      name: "",
      email: "",
      address: "",
      password: "",
      role: "user",
    });
  };

  // ==============================
  // HANDLE CREATE INPUT
  // ==============================
  const handleCreateChange = (e) => {
    const { name, value } = e.target;

    setCreateForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==============================
  // CREATE USER
  // ==============================
  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      setCreateLoading(true);
      setCreateError("");
      setCreateSuccess("");

      const response = await api.post("/admin/users", createForm);

      if (response.data?.success) {
        setCreateSuccess(response.data.message || "User created successfully.");

        await fetchDashboard();

        setTimeout(() => {
          closeCreateModal();
        }, 700);
      } else {
        setCreateError(response.data?.message || "Unable to create user.");
      }
    } catch (err) {
      console.error("Create user error:", err);

      setCreateError(
        err.response?.data?.message ||
          "Something went wrong while creating the user.",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  // ==============================
// OPEN CREATE STORE MODAL
// ==============================
const openCreateStoreModal = () => {
  setCreateStoreForm({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });

  setCreateStoreError("");
  setCreateStoreSuccess("");
  setShowCreateStoreModal(true);
};

// ==============================
// CLOSE CREATE STORE MODAL
// ==============================
const closeCreateStoreModal = () => {
  if (createStoreLoading) return;

  setShowCreateStoreModal(false);
  setCreateStoreError("");
  setCreateStoreSuccess("");

  setCreateStoreForm({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });
};

// ==============================
// HANDLE CREATE STORE INPUT
// ==============================
const handleCreateStoreChange = (e) => {
  const { name, value } = e.target;

  setCreateStoreForm((previous) => ({
    ...previous,
    [name]: value,
  }));
};

// ==============================
// CREATE STORE
// ==============================
const handleCreateStore = async (e) => {
  e.preventDefault();

  try {
    setCreateStoreLoading(true);
    setCreateStoreError("");
    setCreateStoreSuccess("");

    const response = await api.post("/stores", {
      name: createStoreForm.name,
      email: createStoreForm.email,
      address: createStoreForm.address,
      owner_id: Number(createStoreForm.owner_id),
    });

    if (response.data?.success) {
      setCreateStoreSuccess(
        response.data.message || "Store created successfully."
      );

      await fetchDashboard();

      setTimeout(() => {
        closeCreateStoreModal();
      }, 700);
    } else {
      setCreateStoreError(
        response.data?.message || "Unable to create store."
      );
    }
  } catch (err) {
    console.error("Create store error:", err);

    setCreateStoreError(
      err.response?.data?.message ||
        "Something went wrong while creating the store."
    );
  } finally {
    setCreateStoreLoading(false);
  }
};

  return (
    <div className="admin-page">
      {/* =========================================
          HEADER
      ========================================= */}
      <header className="admin-header">
        <div className="admin-brand">
          <div className="admin-brand-mark">S</div>

          <div>
            <h2>StoreRate</h2>
            <span>ADMIN MANAGEMENT</span>
          </div>
        </div>

        <div className="admin-user">
          <div className="admin-avatar">{getInitial(user?.name)}</div>

          <div className="admin-user-info">
            <strong>{user?.name || "Administrator"}</strong>

            <span>Admin</span>
          </div>

          <button className="admin-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* =========================================
          MAIN
      ========================================= */}
      <main className="admin-main">
        {/* =========================================
            HERO
        ========================================= */}
        <section className="admin-hero">
          <div>
            <span className="admin-label">ADMIN DASHBOARD</span>

            <h1>
              Manage the
              <br />
              entire platform.
            </h1>

            <p>Monitor users, stores and ratings from one place.</p>
          </div>

          <div className="admin-hero-side">
            <span>PLATFORM STATUS</span>
            <strong>ACTIVE</strong>
          </div>
        </section>

        {/* =========================================
            ERROR
        ========================================= */}
        {error && <div className="admin-message admin-error">{error}</div>}

        {/* =========================================
            STATS
        ========================================= */}
        <section className="admin-stats">
          <article className="stat-card">
            <span>TOTAL USERS</span>

            <strong>{statsLoading ? "—" : stats.totalUsers}</strong>

            <small>Registered accounts</small>
          </article>

          <article className="stat-card">
            <span>TOTAL STORES</span>

            <strong>{statsLoading ? "—" : stats.totalStores}</strong>

            <small>Stores on platform</small>
          </article>

          <article className="stat-card">
            <span>TOTAL RATINGS</span>

            <strong>{statsLoading ? "—" : stats.totalRatings}</strong>

            <small>Customer ratings</small>
          </article>
        </section>

        {/* =========================================
            USER MANAGEMENT
        ========================================= */}
        <section className="user-management">
          <div className="admin-section-heading">
            <div>
              <span className="admin-label">USER MANAGEMENT</span>

              <h2>Users</h2>
            </div>

            <div className="admin-heading-actions">
              <span className="admin-count">
                {filteredUsers.length}{" "}
                {filteredUsers.length === 1 ? "user" : "users"}
              </span>

              <button className="create-user-button" onClick={openCreateModal}>
                + Add User
              </button>
            </div>
          </div>

          {/* =========================================
              FILTERS
          ========================================= */}
          <div className="admin-filters">
            <div className="admin-search">
              <span>⌕</span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users by name or email..."
              />
            </div>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="role-filter"
            >
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="user">Customer</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>

          {/* =========================================
              USERS TABLE
          ========================================= */}
          {loading ? (
            <div className="admin-message">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="admin-message">No users found.</div>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="table-user">
                          <div className="table-avatar">
                            {getInitial(item.name)}
                          </div>

                          <div>
                            <strong>{item.name}</strong>

                            <span>ID #{item.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>{item.email}</td>

                      <td>
                        <span className="address-cell">
                          {item.address || "—"}
                        </span>
                      </td>

                      <td>
                        <span className={`role-badge role-${item.role}`}>
                          {formatRole(item.role)}
                        </span>
                      </td>

                      <td>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>
                        <button
                          className="edit-user-button"
                          onClick={() => openEditModal(item)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* =========================================
    STORE MANAGEMENT
========================================= */}
        <section className="store-management">
          <div className="admin-section-heading">
            <div>
              <span className="admin-label">STORE MANAGEMENT</span>
              <h2>Stores</h2>
            </div>

            <div className="admin-heading-actions">
              <span className="admin-count">
                {filteredStores.length}{" "}
                {filteredStores.length === 1 ? "store" : "stores"}
              </span>

              <button
                type="button"
                className="create-user-button"
                onClick={openCreateStoreModal}
              >
                + Add Store
              </button>
            </div>
          </div>

          {/* STORE SEARCH */}
          <div className="admin-filters">
            <div className="admin-search">
              <span>⌕</span>

              <input
                type="text"
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
                placeholder="Search stores by name, email or owner..."
              />
            </div>
          </div>

          {/* STORE TABLE */}
          {storesLoading ? (
            <div className="admin-message">Loading stores...</div>
          ) : filteredStores.length === 0 ? (
            <div className="admin-message">
              {storesError || "No stores found."}
            </div>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Store</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Owner</th>
                    <th>Rating</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStores.map((store) => (
                    <tr key={store.id}>
                      <td>
                        <div className="table-user">
                          <div className="table-avatar">
                            {getInitial(store.name)}
                          </div>

                          <div>
                            <strong>{store.name}</strong>
                            <span>ID #{store.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>{store.email}</td>

                      <td>
                        <span className="address-cell">
                          {store.address || "—"}
                        </span>
                      </td>

                      <td>{store.owner_name || "—"}</td>

                      <td>
                        <span className="role-badge">
                          ★ {store.average_rating ?? 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* =========================================
          EDIT USER MODAL
      ========================================= */}
      {showEditModal && selectedUser && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !editLoading) {
              closeEditModal();
            }
          }}
        >
          <div className="edit-modal" onMouseDown={(e) => e.stopPropagation()}>
            {/* MODAL HEADER */}
            <div className="edit-modal-header">
              <div>
                <span className="admin-label">USER MANAGEMENT</span>

                <h2>Edit user</h2>

                <p>
                  Update account details for{" "}
                  <strong>{selectedUser.name}</strong>
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeEditModal}
                disabled={editLoading}
              >
                ×
              </button>
            </div>

            {/* FORM */}
            <form className="edit-user-form" onSubmit={handleUpdateUser}>
              <div className="form-field">
                <label>Name</label>

                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                  minLength={20}
                  maxLength={60}
                  disabled={editLoading}
                />

                <small>20–60 characters</small>
              </div>

              <div className="form-field">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  required
                  disabled={editLoading}
                />
              </div>

              <div className="form-field">
                <label>Address</label>

                <textarea
                  name="address"
                  value={editForm.address}
                  onChange={handleEditChange}
                  required
                  maxLength={400}
                  rows={3}
                  disabled={editLoading}
                />

                <small>Maximum 400 characters</small>
              </div>

              <div className="form-field">
                <label>Role</label>

                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditChange}
                  required
                  disabled={editLoading}
                >
                  <option value="user">Customer</option>

                  <option value="store_owner">Store Owner</option>

                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-field">
                <label>
                  New Password <span>(optional)</span>
                </label>

                <input
                  type="password"
                  name="password"
                  value={editForm.password}
                  onChange={handleEditChange}
                  placeholder="Leave blank to keep current password"
                  minLength={8}
                  maxLength={16}
                  disabled={editLoading}
                />

                <small>
                  8–16 characters, one uppercase letter and one special
                  character
                </small>
              </div>

              {/* FORM ERROR */}
              {editError && (
                <div className="form-message form-error">{editError}</div>
              )}

              {/* FORM SUCCESS */}
              {editSuccess && (
                <div className="form-message form-success">{editSuccess}</div>
              )}

              {/* BUTTONS */}
              <div className="edit-modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeEditModal}
                  disabled={editLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-user-button"
                  disabled={editLoading}
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
    CREATE USER MODAL
========================================= */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !createLoading) {
              closeCreateModal();
            }
          }}
        >
          <div className="edit-modal" onMouseDown={(e) => e.stopPropagation()}>
            {/* MODAL HEADER */}
            <div className="edit-modal-header">
              <div>
                <span className="admin-label">USER MANAGEMENT</span>

                <h2>Create user</h2>

                <p>Add a new account to the StoreRate platform.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeCreateModal}
                disabled={createLoading}
              >
                ×
              </button>
            </div>

            {/* FORM */}
            <form className="edit-user-form" onSubmit={handleCreateUser}>
              <div className="form-field">
                <label>Name</label>

                <input
                  type="text"
                  name="name"
                  value={createForm.name}
                  onChange={handleCreateChange}
                  placeholder="Enter full name"
                  required
                  minLength={20}
                  maxLength={60}
                  disabled={createLoading}
                />

                <small>20–60 characters</small>
              </div>

              <div className="form-field">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={createForm.email}
                  onChange={handleCreateChange}
                  placeholder="Enter email address"
                  required
                  disabled={createLoading}
                />
              </div>

              <div className="form-field">
                <label>Address</label>

                <textarea
                  name="address"
                  value={createForm.address}
                  onChange={handleCreateChange}
                  placeholder="Enter address"
                  required
                  maxLength={400}
                  rows={3}
                  disabled={createLoading}
                />

                <small>Maximum 400 characters</small>
              </div>

              <div className="form-field">
                <label>Role</label>

                <select
                  name="role"
                  value={createForm.role}
                  onChange={handleCreateChange}
                  required
                  disabled={createLoading}
                >
                  <option value="user">Customer</option>

                  <option value="store_owner">Store Owner</option>

                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-field">
                <label>Password</label>

                <input
                  type="password"
                  name="password"
                  value={createForm.password}
                  onChange={handleCreateChange}
                  placeholder="Create a password"
                  required
                  minLength={8}
                  maxLength={16}
                  disabled={createLoading}
                />

                <small>
                  8–16 characters, one uppercase letter and one special
                  character
                </small>
              </div>

              {/* ERROR */}
              {createError && (
                <div className="form-message form-error">{createError}</div>
              )}

              {/* SUCCESS */}
              {createSuccess && (
                <div className="form-message form-success">{createSuccess}</div>
              )}

              {/* BUTTONS */}
              <div className="edit-modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeCreateModal}
                  disabled={createLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-user-button"
                  disabled={createLoading}
                >
                  {createLoading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
    CREATE STORE MODAL
========================================= */}
{showCreateStoreModal && (
  <div
    className="modal-overlay"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget && !createStoreLoading) {
        closeCreateStoreModal();
      }
    }}
  >
    <div
      className="edit-modal"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="edit-modal-header">
        <div>
          <span className="admin-label">STORE MANAGEMENT</span>

          <h2>Create store</h2>

          <p>
            Add a new store to the StoreRate platform.
          </p>
        </div>

        <button
          type="button"
          className="modal-close"
          onClick={closeCreateStoreModal}
          disabled={createStoreLoading}
        >
          ×
        </button>
      </div>

      <form
        className="edit-user-form"
        onSubmit={handleCreateStore}
      >
        <div className="form-field">
          <label>Store Name</label>

          <input
            type="text"
            name="name"
            value={createStoreForm.name}
            onChange={handleCreateStoreChange}
            placeholder="Enter store name"
            required
            minLength={20}
            maxLength={60}
            disabled={createStoreLoading}
          />

          <small>20–60 characters</small>
        </div>

        <div className="form-field">
          <label>Store Email</label>

          <input
            type="email"
            name="email"
            value={createStoreForm.email}
            onChange={handleCreateStoreChange}
            placeholder="Enter store email"
            required
            disabled={createStoreLoading}
          />
        </div>

        <div className="form-field">
          <label>Store Address</label>

          <textarea
            name="address"
            value={createStoreForm.address}
            onChange={handleCreateStoreChange}
            placeholder="Enter store address"
            required
            maxLength={400}
            rows={3}
            disabled={createStoreLoading}
          />

          <small>Maximum 400 characters</small>
        </div>

        <div className="form-field">
          <label>Store Owner</label>

          <select
            name="owner_id"
            value={createStoreForm.owner_id}
            onChange={handleCreateStoreChange}
            required
            disabled={createStoreLoading}
          >
            <option value="">Select store owner</option>

            {storeOwners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} — {owner.email}
              </option>
            ))}
          </select>

          {storeOwners.length === 0 && (
            <small>
              No store owner accounts available.
            </small>
          )}
        </div>

        {createStoreError && (
          <div className="form-message form-error">
            {createStoreError}
          </div>
        )}

        {createStoreSuccess && (
          <div className="form-message form-success">
            {createStoreSuccess}
          </div>
        )}

        <div className="edit-modal-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={closeCreateStoreModal}
            disabled={createStoreLoading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-user-button"
            disabled={createStoreLoading}
          >
            {createStoreLoading ? "Creating..." : "Create Store"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}

export default AdminDashboard;

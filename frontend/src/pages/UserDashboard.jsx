import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function UserDashboard() {
  const { user } = useAuth();

  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/stores");

        const data = response.data;

        if (Array.isArray(data)) {
          setStores(data);
        } else if (Array.isArray(data.stores)) {
          setStores(data.stores);
        } else if (Array.isArray(data.data)) {
          setStores(data.data);
        } else {
          setStores([]);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load stores. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const categories = useMemo(() => {
    const values = stores
      .map((store) => store.category)
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [stores]);

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const name = store.name || "";
      const address = store.address || "";
      const storeCategory = store.category || "";

      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        address.toLowerCase().includes(search.toLowerCase()) ||
        storeCategory.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || storeCategory === category;

      return matchesSearch && matchesCategory;
    });
  }, [stores, search, category]);

  const getInitial = (name = "S") => {
    return name.charAt(0).toUpperCase();
  };

  const getRating = (store) => {
    const rating =
      store.averageRating ??
      store.average_rating ??
      store.rating ??
      0;

    return Number(rating).toFixed(1);
  };

  const getReviewCount = (store) => {
    return (
      store.reviewCount ??
      store.review_count ??
      store.totalRatings ??
      store.total_ratings ??
      0
    );
  };

  return (
    <div className="dashboard-page">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="brand-mark">S</div>

          <div>
            <h2>StoreRate</h2>
            <span>STORE DISCOVERY</span>
          </div>
        </div>

        <div className="dashboard-user">
          <div className="user-avatar">
            {getInitial(user?.name)}
          </div>

          <div className="user-info">
            <strong>{user?.name || "User"}</strong>
            <span>Customer</span>
          </div>

          <button
            className="logout-button"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="dashboard-main">
        {/* INTRO */}
        <section className="dashboard-intro">
          <div>
            <span className="section-label">DASHBOARD</span>

            <h1>
              Find stores
              <br />
              worth rating.
            </h1>

            <p>
              Discover stores, explore what people think,
              and share your own experience.
            </p>
          </div>

          <div className="dashboard-stat">
            <span>Available stores</span>
            <strong>{stores.length}</strong>
          </div>
        </section>

        {/* SEARCH */}
        <section className="search-section">
          <div className="search-box">
            <span>⌕</span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stores by name, category or location..."
            />
          </div>
        </section>

        {/* STORES */}
        <section>
          <div className="section-heading">
            <div>
              <span className="section-label">EXPLORE</span>
              <h2>Popular stores</h2>
            </div>

            <span className="store-count">
              {filteredStores.length}{" "}
              {filteredStores.length === 1 ? "store" : "stores"}
            </span>
          </div>

          {/* FILTERS */}
          <div className="filter-row">
            {categories.map((item) => (
              <button
                key={item}
                className={`filter-button ${
                  category === item ? "active" : ""
                }`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {/* LOADING */}
          {loading && (
            <div className="dashboard-message">
              Loading stores...
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="dashboard-message error">
              {error}
            </div>
          )}

          {/* EMPTY */}
          {!loading && !error && filteredStores.length === 0 && (
            <div className="dashboard-message">
              No stores found.
            </div>
          )}

          {/* STORE GRID */}
          {!loading && !error && filteredStores.length > 0 && (
            <div className="store-grid">
              {filteredStores.map((store) => (
                <article
                  className="store-card"
                  key={store.id}
                >
                  <div className="store-card-top">
                    <div className="store-icon">
                      {getInitial(store.name)}
                    </div>

                    <div className="rating">
                      ★ {getRating(store)}
                    </div>
                  </div>

                  <h3>
                    {store.name || "Unnamed Store"}
                  </h3>

                  <p className="store-category">
                    {store.category || "Store"}
                  </p>

                  <p className="store-location">
                    <span>●</span>
                    {store.address || "Location unavailable"}
                  </p>

                  <div className="store-card-footer">
                    <span>
                      {getReviewCount(store)} reviews
                    </span>

                    <button
                      onClick={() => {
                        window.location.href = `/store/${store.id}`;
                      }}
                    >
                      View store →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default UserDashboard;
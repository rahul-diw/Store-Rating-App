import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./StoreOwnerDashboard.css";

function StoreOwnerDashboard() {
  const { user } = useAuth();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [storeRatings, setStoreRatings] = useState({});
  const [ratingsLoading, setRatingsLoading] = useState({});
  

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/store-owner/dashboard");
      if (response.data?.success) {
        const ownerStores = response.data.stores || [];

        setStores(ownerStores);

        ownerStores.forEach((store) => {
          fetchStoreRatings(store.id);
        });
      } else {
        setError(
          response.data?.message || "Unable to load your store dashboard.",
        );
      }
    } catch (err) {
      console.error("Store owner dashboard error:", err);

      setError(
        err.response?.data?.message ||
          "Something went wrong while loading your dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreRatings = async (storeId) => {
    try {
      setRatingsLoading((previous) => ({
        ...previous,
        [storeId]: true,
      }));

      const response = await api.get(`/stores/${storeId}/ratings`);

      if (response.data?.success) {
        setStoreRatings((previous) => ({
          ...previous,
          [storeId]: response.data.ratings || [],
        }));
      }
    } catch (err) {
      console.error("Store ratings error:", err);

      setStoreRatings((previous) => ({
        ...previous,
        [storeId]: [],
      }));
    } finally {
      setRatingsLoading((previous) => ({
        ...previous,
        [storeId]: false,
      }));
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  const getInitial = (name = "S") => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="owner-page">
      {/* HEADER */}
      <header className="owner-header">
        <div className="owner-brand">
          <div className="owner-brand-mark">S</div>

          <div>
            <h2>StoreRate</h2>
            <span>STORE OWNER</span>
          </div>
        </div>

        <div className="owner-user">
          <div className="owner-avatar">{getInitial(user?.name)}</div>

          <div className="owner-user-info">
            <strong>{user?.name || "Store Owner"}</strong>
            <span>Store Owner</span>
          </div>

          <button className="owner-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="owner-main">
        {/* HERO */}
        <section className="owner-hero">
          <div>
            <span className="owner-label">STORE OWNER DASHBOARD</span>

            <h1>
              Your store.
              <br />
              Your ratings.
            </h1>

            <p>Track how customers are rating your store from one place.</p>
          </div>

          <div className="owner-status">
            <span>ACCOUNT STATUS</span>
            <strong>ACTIVE</strong>
          </div>
        </section>

        {/* ERROR */}
        {error && <div className="owner-message owner-error">{error}</div>}

        {/* LOADING */}
        {loading ? (
          <div className="owner-message">Loading your store...</div>
        ) : stores.length === 0 ? (
          <div className="owner-message">
            No store is assigned to your account.
          </div>
        ) : (
          <section className="owner-stores">
            {stores.map((store) => (
              <article className="owner-store-card" key={store.id}>
                <div className="owner-store-top">
                  <div>
                    <span className="owner-label">YOUR STORE</span>

                    <h2>{store.name}</h2>
                  </div>

                  <div className="owner-store-id">ID #{store.id}</div>
                </div>

                <div className="owner-store-info">
                  <div>
                    <span>EMAIL</span>
                    <strong>{store.email}</strong>
                  </div>

                  <div>
                    <span>ADDRESS</span>
                    <strong>{store.address}</strong>
                  </div>
                </div>

                <div className="owner-stats">
                  <div className="owner-stat">
                    <span>AVERAGE RATING</span>

                    <strong>
                      ★ {Number(store.average_rating || 0).toFixed(1)}
                    </strong>
                  </div>

                  <div className="owner-stat">
                    <span>TOTAL RATINGS</span>

                    <strong>{store.total_ratings || 0}</strong>
                  </div>
                </div>
                <div className="owner-reviews">
                  <div className="owner-reviews-header">
                    <div>
                      <span className="owner-label">CUSTOMER REVIEWS</span>
                      <h3>Recent ratings</h3>
                    </div>

                    <span className="owner-review-count">
                      {(storeRatings[store.id] || []).length} reviews
                    </span>
                  </div>

                  {ratingsLoading[store.id] ? (
                    <div className="owner-review-message">
                      Loading ratings...
                    </div>
                  ) : (storeRatings[store.id] || []).length === 0 ? (
                    <div className="owner-review-message">
                      No customer ratings yet.
                    </div>
                  ) : (
                    <div className="owner-review-list">
                      {(storeRatings[store.id] || []).map((rating) => (
                        <div className="owner-review" key={rating.id}>
                          <div className="owner-review-top">
                            <div className="owner-review-user">
                              <div className="owner-review-avatar">
                                {getInitial(
                                  rating.user_name || rating.name || "Customer",
                                )}
                              </div>

                              <div>
                                <strong>
                                  {rating.user_name ||
                                    rating.name ||
                                    "Customer"}
                                </strong>

                                <span>
                                  {rating.created_at
                                    ? new Date(
                                        rating.created_at,
                                      ).toLocaleDateString()
                                    : ""}
                                </span>
                              </div>
                            </div>

                            <div className="owner-review-rating">
                              {"★".repeat(Number(rating.rating || 0))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default StoreOwnerDashboard;

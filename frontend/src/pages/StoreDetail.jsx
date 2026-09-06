import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./StoreDetail.css";

function StoreDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const [storesResponse, ratingsResponse] = await Promise.all([
          api.get("/stores"),
          api.get(`/stores/${id}/ratings`),
        ]);

        const storesData = storesResponse.data;

        const allStores = Array.isArray(storesData)
          ? storesData
          : Array.isArray(storesData.stores)
          ? storesData.stores
          : Array.isArray(storesData.data)
          ? storesData.data
          : [];

        const foundStore = allStores.find(
          (item) => Number(item.id) === Number(id)
        );

        if (!foundStore) {
          setError("Store not found.");
          return;
        }

        setStore(foundStore);

        const ratingsData = ratingsResponse.data;

        const storeRatings = Array.isArray(ratingsData.ratings)
          ? ratingsData.ratings
          : [];

        setRatings(storeRatings);

        const myRating = storeRatings.find(
          (rating) => Number(rating.user_id) === Number(user?.id)
        );

        if (myRating) {
          setSelectedRating(Number(myRating.rating));
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load store details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStore();
    }
  }, [id, user?.id]);

  const averageRating = useMemo(() => {
    if (!ratings.length) {
      return 0;
    }

    const total = ratings.reduce(
      (sum, item) => sum + Number(item.rating || 0),
      0
    );

    return total / ratings.length;
  }, [ratings]);

  const handleRating = async () => {
    if (!selectedRating) {
      setMessage("Please select a rating first.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const response = await api.post("/ratings", {
        store_id: Number(id),
        rating: selectedRating,
      });

      setMessage(
        response.data?.message || "Rating submitted successfully."
      );

      // Refresh ratings after submitting
      const ratingsResponse = await api.get(`/stores/${id}/ratings`);

      const updatedRatings = Array.isArray(ratingsResponse.data?.ratings)
        ? ratingsResponse.data.ratings
        : [];

      setRatings(updatedRatings);
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Unable to submit rating. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getInitial = (name = "S") => {
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="store-detail-page">
        <div className="store-detail-loading">
          Loading store...
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="store-detail-page">
        <main className="store-detail-main">
          <Link to="/user" className="back-link">
            ← Back to stores
          </Link>

          <div className="store-detail-error">
            {error || "Store not found."}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="store-detail-page">
      <header className="store-detail-header">
        <Link to="/user" className="detail-brand">
          <div className="detail-brand-mark">S</div>

          <div>
            <strong>StoreRate</strong>
            <span>STORE DISCOVERY</span>
          </div>
        </Link>

        <Link to="/user" className="back-link header-back">
          ← All stores
        </Link>
      </header>

      <main className="store-detail-main">
        <Link to="/user" className="back-link">
          ← Back to stores
        </Link>

        <section className="store-hero">
          <div className="store-hero-left">
            <div className="store-large-icon">
              {getInitial(store.name)}
            </div>

            <span className="detail-label">STORE PROFILE</span>

            <h1>{store.name}</h1>

            <p className="store-address">
              {store.address || "Location unavailable"}
            </p>

            <p className="store-email">
              {store.email || "Email unavailable"}
            </p>
          </div>

          <div className="rating-summary">
            <span className="detail-label">RATING</span>

            <strong>{averageRating.toFixed(1)}</strong>

            <div className="summary-stars">
              {"★★★★★"}
            </div>

            <span>
              {ratings.length}{" "}
              {ratings.length === 1 ? "review" : "reviews"}
            </span>
          </div>
        </section>

        <div className="detail-divider" />

        <section className="rating-area">
          <div className="rating-copy">
            <span className="detail-label">YOUR EXPERIENCE</span>

            <h2>Rate this store.</h2>

            <p>
              Share your experience and help other customers
              make better decisions.
            </p>
          </div>

          <div className="rating-action">
            <div className="star-selector">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={
                    star <= selectedRating
                      ? "rating-star active"
                      : "rating-star"
                  }
                  onClick={() => setSelectedRating(star)}
                  aria-label={`Rate ${star} out of 5`}
                >
                  ★
                </button>
              ))}
            </div>

            <div className="rating-action-row">
              <span>
                {selectedRating
                  ? `${selectedRating} / 5`
                  : "Select a rating"}
              </span>

              <button
                type="button"
                className="submit-rating-button"
                onClick={handleRating}
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Submit rating"}
              </button>
            </div>

            {message && (
              <div className="rating-message">
                {message}
              </div>
            )}
          </div>
        </section>

        <div className="detail-divider" />

        <section className="reviews-section">
          <div className="reviews-heading">
            <div>
              <span className="detail-label">COMMUNITY</span>
              <h2>Customer ratings</h2>
            </div>

            <span className="review-count">
              {ratings.length}{" "}
              {ratings.length === 1 ? "review" : "reviews"}
            </span>
          </div>

          {ratings.length === 0 ? (
            <div className="empty-reviews">
              No ratings yet. Be the first to rate this store.
            </div>
          ) : (
            <div className="reviews-list">
              {ratings.map((rating) => (
                <article
                  className="review-item"
                  key={rating.id}
                >
                  <div className="review-user">
                    <div className="review-avatar">
                      {getInitial(rating.user_name)}
                    </div>

                    <div>
                      <strong>
                        {rating.user_name || "Customer"}
                      </strong>

                      <span>
                        {formatDate(
                          rating.created_at
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="review-rating">
                    <span>{"★".repeat(Number(rating.rating))}</span>

                    <strong>
                      {Number(rating.rating).toFixed(1)}
                    </strong>
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

export default StoreDetail;
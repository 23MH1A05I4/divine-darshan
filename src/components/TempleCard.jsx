import { Link } from "react-router-dom";
import { getTempleImage, DEFAULT_IMAGE } from "../utils_templeImages";

const TempleCard = ({ temple }) => {
  const image = getTempleImage(temple);

  return (
    <div className="temple-card">
      <div className="temple-card-image-wrap">
        <img
          src={image}
          alt={temple.name}
          className="temple-card-image"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_IMAGE;
          }}
        />
      </div>

      <div className="temple-card-body">
        <h3 className="temple-card-title">
          {temple.name}
        </h3>

        <p className="temple-card-location">
          📍 {temple.city}, {temple.state}
        </p>

        {temple.description && (
          <p className="temple-card-description">
            {temple.description.length > 100
              ? `${temple.description.slice(0, 100)}...`
              : temple.description}
          </p>
        )}

        <div className="temple-card-actions">
          <Link
            to={`/temples/${temple._id}`}
            className="btn btn-outline"
          >
            View Temple
          </Link>

          <Link
            to={`/booking/${temple._id}`}
            className="btn btn-solid"
          >
            Book Darshan
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TempleCard;
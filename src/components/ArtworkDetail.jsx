import React, { useState, useCallback } from "react";
import {
  X,
  Share2,
  Heart,
  MapPin,
  ExternalLink,
  ChevronDown,
  Images,
  ZoomIn,
} from "lucide-react";
import "./ArtworkDetail.css";

/* ──────────────────────── Fullscreen Lightbox ──────────────────────── */
function Lightbox({ src, alt, onClose }) {
  return (
    <div className="lightbox" onClick={onClose}>
      <div className="lightbox__backdrop" />
      <button className="lightbox__close" aria-label="Close fullscreen">
        <X size={22} strokeWidth={2} />
      </button>
      <img src={src} alt={alt} className="lightbox__img" />
    </div>
  );
}

/* ──────────────────────── Gallery Bento Grid ──────────────────────── */
const BENTO = ["gal-wide", "gal-tall", "gal-normal", "gal-normal"];

function GalleryBento({ images, title, onImageClick }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="artwork-panel__gallery-section">
      <h3 className="artwork-panel__gallery-heading">
        <Images size={14} strokeWidth={2.2} />
        Gallery
        <span className="artwork-panel__gallery-count">{images.length}</span>
      </h3>
      <div className="artwork-panel__gallery-bento">
        {images.map((img, i) => (
          <div
            key={i}
            className={`artwork-panel__gallery-item ${BENTO[i % BENTO.length]}`}
            onClick={() => onImageClick(img)}
          >
            <img src={img} alt={`${title} – detail ${i + 1}`} loading="lazy" />
            <div className="artwork-panel__gallery-zoom">
              <ZoomIn size={16} strokeWidth={2} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────── Main Component ──────────────────────── */
export default function ArtworkDetail({
  artwork,
  onClose,
  isFavorited,
  onToggleFavorite,
  onFindInMuseum,
}) {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const openLightbox = useCallback((src) => setLightboxSrc(src), []);
  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

  if (!artwork) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleShare = async () => {
    const shareData = {
      title: artwork.title,
      text: `${artwork.title} by ${artwork.artist} — The Metropolitan Museum of Art`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* cancelled */
      }
    }
  };

  const details = [
    { label: "Medium", value: artwork.medium },
    { label: "Dimensions", value: artwork.dimensions },
    { label: "Department", value: artwork.department },
    { label: "Gallery", value: artwork.gallery },
    { label: "Floor", value: artwork.floor ? `Floor ${artwork.floor}` : null },
  ].filter((d) => d.value);

  const galleryImages = artwork.gallery_images || [];

  return (
    <>
      <div className="artwork-overlay" onClick={handleBackdropClick}>
        <div className="artwork-overlay__backdrop" />

        <div className="artwork-panel">
          {/* ───── FLOATING TOP BAR ───── */}
          <div className="artwork-panel__topbar">
            <button
              className="artwork-panel__pill-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={18} strokeWidth={2.2} />
            </button>
            <div className="artwork-panel__drag-handle" />
            <div className="artwork-panel__pill-group">
              <button
                className={`artwork-panel__pill-btn${isFavorited ? " artwork-panel__pill-btn--fav" : ""}`}
                onClick={onToggleFavorite}
                aria-label="Favorite"
              >
                <Heart
                  size={18}
                  strokeWidth={isFavorited ? 0 : 2.2}
                  fill={isFavorited ? "currentColor" : "none"}
                />
              </button>
              <button
                className="artwork-panel__pill-btn"
                onClick={handleShare}
                aria-label="Share"
              >
                <Share2 size={16} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {/* ───── THE ARTWORK — THE GRAAL ───── */}
          <div className="artwork-panel__showcase">
            <div
              className="artwork-panel__artwork-frame"
              onClick={() => openLightbox(artwork.image)}
            >
              <img
                src={artwork.image}
                alt={artwork.title}
                className="artwork-panel__artwork-img"
              />
              <div className="artwork-panel__fullscreen-hint">
                <ZoomIn size={14} strokeWidth={2.2} />
              </div>
            </div>
          </div>

          {/* ───── CONTENT ───── */}
          <div className="artwork-panel__content">
            {/* Title block */}
            <div className="artwork-panel__title-block">
              <h1 className="artwork-panel__title">{artwork.title}</h1>
              <div className="artwork-panel__meta-row">
                <span className="artwork-panel__artist">{artwork.artist}</span>
                {artwork.date && (
                  <span className="artwork-panel__date">
                    <span className="artwork-panel__dot" />
                    {artwork.date}
                  </span>
                )}
              </div>
            </div>

            {/* Tags */}
            {artwork.tags && artwork.tags.length > 0 && (
              <div className="artwork-panel__tags">
                {artwork.tags.map((tag) => (
                  <span key={tag} className="artwork-panel__tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {artwork.description && (
              <div className="artwork-panel__desc-block">
                <p
                  className={`artwork-panel__desc${!showFullDesc ? " artwork-panel__desc--clamped" : ""}`}
                >
                  {artwork.description}
                </p>
                {artwork.description.length > 150 && (
                  <button
                    className="artwork-panel__read-more"
                    onClick={() => setShowFullDesc(!showFullDesc)}
                  >
                    {showFullDesc ? "Show less" : "Read more"}
                    <ChevronDown
                      size={14}
                      strokeWidth={2}
                      style={{
                        transform: showFullDesc ? "rotate(180deg)" : "none",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </button>
                )}
              </div>
            )}

            {artwork.sourceUrl && (
              <a
                href={artwork.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="artwork-panel__source-link"
              >
                <ExternalLink size={14} strokeWidth={2} />
                View on The Met
              </a>
            )}

            {/* Gallery Bento */}
            <GalleryBento
              images={galleryImages}
              title={artwork.title}
              onImageClick={openLightbox}
            />

            {/* Details */}
            {details.length > 0 && (
              <div className="artwork-panel__details-card">
                <h3 className="artwork-panel__details-heading">Details</h3>
                <div className="artwork-panel__details-list">
                  {details.map(({ label, value }) => (
                    <div key={label} className="artwork-panel__detail-row">
                      <span className="artwork-panel__detail-label">
                        {label}
                      </span>
                      <span className="artwork-panel__detail-value">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ───── BOTTOM BAR ───── */}
          <div className="artwork-panel__bottombar">
            <button
              className="artwork-panel__locate-btn"
              onClick={() => onFindInMuseum?.(artwork)}
            >
              <MapPin size={18} strokeWidth={2.2} />
              <span>Find in Museum</span>
            </button>
            {artwork.gallery && (
              <span className="artwork-panel__gallery-pill">
                {artwork.gallery}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ───── FULLSCREEN LIGHTBOX ───── */}
      {lightboxSrc && (
        <Lightbox
          src={lightboxSrc}
          alt={artwork.title}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}

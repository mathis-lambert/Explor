import React from "react";
import { X, Check } from "lucide-react";
import "./SortSheet.css";

const OPTIONS = [
  { id: "relevance", label: "Relevance" },
  { id: "title", label: "Title A–Z" },
  { id: "artist", label: "Artist A–Z" },
  { id: "newest", label: "Newest date text first" },
];

export default function SortSheet({ value, onChange, onClose }) {
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="sort-overlay" onClick={handleBackdropClick}>
      <div className="sort-overlay__backdrop" />

      <div className="sort-panel">
        <div className="sort-panel__header">
          <div className="sort-panel__drag-handle" />
          <h2 className="sort-panel__title">Sort Artworks</h2>
          <button className="sort-panel__close" onClick={onClose} aria-label="Close sort options">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="sort-panel__options">
          {OPTIONS.map((option) => {
            const isSelected = value === option.id;

            return (
              <button
                key={option.id}
                className={`sort-panel__option${isSelected ? " sort-panel__option--active" : ""}`}
                onClick={() => {
                  onChange(option.id);
                  onClose();
                }}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={16} strokeWidth={2.4} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import {
  X,
  Minus,
  Plus,
  Lock,
  ShieldCheck,
  Calendar,
  Clock,
  Users,
} from "lucide-react";
import "./TicketCheckout.css";

const SERVICE_FEE = 2.5;

export default function TicketCheckout({ ticket, onClose, onConfirm }) {
  const [quantity, setQuantity] = useState(1);

  if (!ticket) return null;

  const subtotal = ticket.price * quantity;
  const total = subtotal + SERVICE_FEE;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => Math.min(10, q + 1));

  const formatPrice = (value) =>
    `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="checkout-overlay" onClick={handleBackdropClick}>
      <div className="checkout-overlay__backdrop" />

      <div className="checkout-panel">
        {/* ===== HANDLE + CLOSE ===== */}
        <div className="checkout-panel__header">
          <div className="checkout-panel__drag-handle" />
          <button
            className="checkout-panel__close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        {/* ===== SCROLLABLE CONTENT ===== */}
        <div className="checkout-panel__body">
          {/* --- Order Summary --- */}
          <div className="checkout-panel__summary">
            <h2 className="checkout-panel__ticket-name">{ticket.name}</h2>
            {ticket.subtitle && (
              <p className="checkout-panel__ticket-subtitle">
                {ticket.subtitle}
              </p>
            )}
          </div>

          <div className="checkout-panel__divider" />

          {/* --- Visit Details --- */}
          <div className="checkout-panel__details">
            <h3 className="checkout-panel__details-heading">Visit Details</h3>

            <div className="checkout-panel__detail-row">
              <div className="checkout-panel__detail-icon">
                <Calendar size={16} strokeWidth={1.8} />
              </div>
              <span className="checkout-panel__detail-label">Date</span>
              <span className="checkout-panel__detail-value">
                Today, Feb 6, 2026
              </span>
            </div>

            <div className="checkout-panel__detail-row">
              <div className="checkout-panel__detail-icon">
                <Clock size={16} strokeWidth={1.8} />
              </div>
              <span className="checkout-panel__detail-label">Time</span>
              <span className="checkout-panel__detail-value">
                10:00 AM &ndash; 5:30 PM
              </span>
            </div>

            <div className="checkout-panel__detail-row">
              <div className="checkout-panel__detail-icon">
                <Users size={16} strokeWidth={1.8} />
              </div>
              <span className="checkout-panel__detail-label">Quantity</span>
              <div className="checkout-panel__quantity">
                <button
                  className="checkout-panel__qty-btn"
                  onClick={decrement}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} strokeWidth={2} />
                </button>
                <span className="checkout-panel__qty-value">{quantity}</span>
                <button
                  className="checkout-panel__qty-btn"
                  onClick={increment}
                  disabled={quantity >= 10}
                  aria-label="Increase quantity"
                >
                  <Plus size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

          <div className="checkout-panel__divider" />

          {/* --- Price Breakdown --- */}
          <div className="checkout-panel__pricing">
            <div className="checkout-panel__price-row">
              <span className="checkout-panel__price-label">
                {ticket.name} &times; {quantity}
              </span>
              <span className="checkout-panel__price-value">
                {formatPrice(subtotal)}
              </span>
            </div>

            <div className="checkout-panel__price-row">
              <span className="checkout-panel__price-label">Service fee</span>
              <span className="checkout-panel__price-value">
                {formatPrice(SERVICE_FEE)}
              </span>
            </div>

            <div className="checkout-panel__divider checkout-panel__divider--subtle" />

            <div className="checkout-panel__price-row checkout-panel__price-row--total">
              <span className="checkout-panel__price-total-label">Total</span>
              <span className="checkout-panel__price-total-value">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>

        {/* ===== STICKY FOOTER ===== */}
        <div className="checkout-panel__footer">
          <button className="checkout-panel__confirm-btn" onClick={onConfirm}>
            <Lock size={16} strokeWidth={2} />
            <span>Confirm Purchase</span>
          </button>

          <p className="checkout-panel__security-note">
            <ShieldCheck size={14} strokeWidth={1.8} />
            <span>Secured payment &mdash; This is a demo</span>
          </p>
        </div>
      </div>
    </div>
  );
}

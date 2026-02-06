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
  CheckCircle2,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import { simulateTicketPurchase } from "../mocks/uiSimulation";
import "./TicketCheckout.css";

const SERVICE_FEE = 2.5;
const STEPS = ["select", "review", "confirm"];

function formatPrice(value) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function TicketCheckout({ session, onClose, onComplete }) {
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState("select");
  const [isProcessing, setIsProcessing] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  const ticket = session?.ticket;
  if (!ticket) return null;

  const subtotal = ticket.price * quantity;
  const total = subtotal + SERVICE_FEE;

  const activeStepIndex = STEPS.indexOf(step);

  const visitDateLabel = session.visitDate
    ? new Date(session.visitDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Today";

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const decrement = () => setQuantity((current) => Math.max(1, current - 1));
  const increment = () => setQuantity((current) => Math.min(10, current + 1));

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    setDeclineReason("");

    const result = await simulateTicketPurchase({
      session,
      quantity,
      selectedTimeLabel: session.timeLabel,
    });

    setIsProcessing(false);

    if (result.status === "declined") {
      setDeclineReason(result.reason);
      return;
    }

    if (result.status === "unavailable") {
      setDeclineReason(result.reason);
      return;
    }

    setConfirmation(result);
    setStep("confirm");
  };

  return (
    <div className="checkout-overlay" onClick={handleBackdropClick}>
      <div className="checkout-overlay__backdrop" />

      <div className="checkout-panel">
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

        <div className="checkout-panel__body">
          <div className="checkout-panel__summary">
            <h2 className="checkout-panel__ticket-name">{ticket.name}</h2>
            {ticket.subtitle && (
              <p className="checkout-panel__ticket-subtitle">{ticket.subtitle}</p>
            )}
          </div>

          <div className="checkout-panel__stepper">
            {STEPS.map((stepId, index) => (
              <div key={stepId} className="checkout-panel__step-item">
                <span
                  className={`checkout-panel__step-dot${index <= activeStepIndex ? " checkout-panel__step-dot--active" : ""}`}
                >
                  {index + 1}
                </span>
                <span className="checkout-panel__step-label">{stepId}</span>
              </div>
            ))}
          </div>

          <div className="checkout-panel__divider" />

          {step === "select" && (
            <>
              <div className="checkout-panel__details">
                <h3 className="checkout-panel__details-heading">Visit Details</h3>

                <div className="checkout-panel__detail-row">
                  <div className="checkout-panel__detail-icon">
                    <Calendar size={16} strokeWidth={1.8} />
                  </div>
                  <span className="checkout-panel__detail-label">Date</span>
                  <span className="checkout-panel__detail-value">{visitDateLabel}</span>
                </div>

                <div className="checkout-panel__detail-row">
                  <div className="checkout-panel__detail-icon">
                    <Clock size={16} strokeWidth={1.8} />
                  </div>
                  <span className="checkout-panel__detail-label">Time</span>
                  <span className="checkout-panel__detail-value">{session.timeLabel}</span>
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

              {session.isUnavailable && (
                <div className="checkout-panel__state-banner checkout-panel__state-banner--warn">
                  <AlertTriangle size={16} strokeWidth={2} />
                  <span>This date is fully booked in this prototype.</span>
                </div>
              )}
            </>
          )}

          {step === "review" && (
            <>
              <div className="checkout-panel__pricing">
                <div className="checkout-panel__price-row">
                  <span className="checkout-panel__price-label">
                    {ticket.name} × {quantity}
                  </span>
                  <span className="checkout-panel__price-value">{formatPrice(subtotal)}</span>
                </div>

                <div className="checkout-panel__price-row">
                  <span className="checkout-panel__price-label">Service fee</span>
                  <span className="checkout-panel__price-value">{formatPrice(SERVICE_FEE)}</span>
                </div>

                <div className="checkout-panel__divider checkout-panel__divider--subtle" />

                <div className="checkout-panel__price-row checkout-panel__price-row--total">
                  <span className="checkout-panel__price-total-label">Total</span>
                  <span className="checkout-panel__price-total-value">{formatPrice(total)}</span>
                </div>
              </div>

              {declineReason && (
                <div className="checkout-panel__state-banner checkout-panel__state-banner--error">
                  <AlertTriangle size={16} strokeWidth={2} />
                  <span>{declineReason}</span>
                </div>
              )}
            </>
          )}

          {step === "confirm" && (
            <div className="checkout-panel__confirm-state">
              <div className="checkout-panel__pass-icon">
                <CheckCircle2 size={28} strokeWidth={1.8} />
              </div>
              <h3 className="checkout-panel__confirm-title">Tickets Reserved</h3>
              <p className="checkout-panel__confirm-copy">
                Confirmation {confirmation?.confirmationCode}
              </p>
              <div className="checkout-panel__mock-pass">
                <div className="checkout-panel__mock-pass-header">
                  <span>Explor Admission Pass</span>
                  <span>{visitDateLabel}</span>
                </div>
                <div className="checkout-panel__mock-qr" aria-hidden="true" />
                <div className="checkout-panel__mock-pass-footer">
                  <span>{session.timeLabel}</span>
                  <span>{quantity} guest(s)</span>
                </div>
              </div>
              <button className="checkout-panel__wallet-btn">
                <Wallet size={16} strokeWidth={2} />
                Add to Wallet (Mock)
              </button>
            </div>
          )}
        </div>

        <div className="checkout-panel__footer">
          {step === "select" && (
            <button
              className="checkout-panel__confirm-btn"
              onClick={() => setStep("review")}
              disabled={session.isUnavailable}
            >
              <Lock size={16} strokeWidth={2} />
              <span>Continue to Review</span>
            </button>
          )}

          {step === "review" && (
            <button
              className="checkout-panel__confirm-btn"
              onClick={handleConfirmPayment}
              disabled={isProcessing}
            >
              <Lock size={16} strokeWidth={2} />
              <span>{isProcessing ? "Processing..." : "Confirm Purchase"}</span>
            </button>
          )}

          {step === "confirm" && (
            <button
              className="checkout-panel__confirm-btn"
              onClick={() => onComplete(confirmation)}
            >
              <CheckCircle2 size={16} strokeWidth={2} />
              <span>Done</span>
            </button>
          )}

          <p className="checkout-panel__security-note">
            <ShieldCheck size={14} strokeWidth={1.8} />
            <span>Secure prototype flow — no real payment is processed</span>
          </p>
        </div>
      </div>
    </div>
  );
}

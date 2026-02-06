import React, { useState } from "react";
import {
  Clock,
  Check,
  Info,
  ArrowRight,
  Star,
  Sparkles,
  Ticket,
} from "lucide-react";
import "./TicketsPage.css";

const ticketTypes = [
  {
    id: "general",
    name: "General Admission",
    subtitle: "Full museum access",
    price: 30,
    originalPrice: null,
    popular: false,
    color: "#9C5A2C",
    features: [
      "Permanent collection access",
      "General exhibitions",
      "Audio guide available on-site",
    ],
  },
  {
    id: "premium",
    name: "Premium Pass",
    subtitle: "Best for first-time visitors",
    price: 45,
    originalPrice: 55,
    popular: true,
    color: "#7A2B3A",
    features: [
      "Everything in General Admission",
      "Priority entry lane",
      "One special exhibition included",
      "Discount at museum stores",
    ],
  },
  {
    id: "student",
    name: "Student",
    subtitle: "Valid student ID required",
    price: 18,
    originalPrice: null,
    popular: false,
    color: "#3A5B8B",
    features: [
      "Full museum access",
      "Student-rate admission",
      "Available for same-day purchase",
    ],
  },
];

function generateNextSevenDays() {
  const days = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      dayName: dayNames[date.getDay()],
      dateNum: date.getDate(),
      month: monthNames[date.getMonth()],
      isToday: i === 0,
      key: date.toISOString(),
    });
  }
  return days;
}

export default function TicketsPage({ state }) {
  const [selectedDate, setSelectedDate] = useState(0);
  const datePills = generateNextSevenDays();

  return (
    <div className="page tickets-page">
      {/* ===== HEADER ===== */}
      <header className="tix-header">
        <h1 className="tix-header__title">Tickets</h1>
        <div className="tix-header__hours">
          <Clock size={14} strokeWidth={2} />
          <span>Open 10 AM – 5:30 PM</span>
        </div>
      </header>

      {/* ===== DATE SELECTOR ===== */}
      <section className="tix-dates">
        <div className="tix-dates__scroll">
          {datePills.map((day, index) => (
            <button
              key={day.key}
              className={`tix-date${index === selectedDate ? " tix-date--active" : ""}`}
              onClick={() => setSelectedDate(index)}
            >
              <span className="tix-date__day">
                {day.isToday ? "Today" : day.dayName}
              </span>
              <span className="tix-date__num">{day.dateNum}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ===== TICKET CARDS — SKEUOMORPHIC ===== */}
      <section className="tix-list section">
        {ticketTypes.map((ticket, index) => (
          <article
            key={ticket.id}
            className={`tix-ticket${ticket.popular ? " tix-ticket--popular" : ""}`}
            style={{
              "--tix-color": ticket.color,
              animationDelay: `${0.1 + index * 0.08}s`,
            }}
          >
            {/* Left color strip */}
            <div className="tix-ticket__strip" />

            {/* Notch cutouts */}
            <div className="tix-ticket__notch tix-ticket__notch--top" />
            <div className="tix-ticket__notch tix-ticket__notch--bottom" />

            {/* Perforation line */}
            <div className="tix-ticket__perforation" />

            {/* Main section */}
            <div className="tix-ticket__main">
              <div className="tix-ticket__top-row">
                <div className="tix-ticket__name-group">
                  <h2 className="tix-ticket__name">{ticket.name}</h2>
                  <p className="tix-ticket__subtitle">{ticket.subtitle}</p>
                </div>
                {ticket.popular && (
                  <span className="tix-ticket__badge">
                    <Star size={10} strokeWidth={2.5} fill="currentColor" />
                    Popular
                  </span>
                )}
              </div>

              <ul className="tix-ticket__features">
                {ticket.features.slice(0, 3).map((feature) => (
                  <li key={feature} className="tix-ticket__feature">
                    <Check
                      size={12}
                      strokeWidth={3}
                      className="tix-ticket__check"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
                {ticket.features.length > 3 && (
                  <li className="tix-ticket__feature tix-ticket__feature--more">
                    +{ticket.features.length - 3} more
                  </li>
                )}
              </ul>
            </div>

            {/* Price stub (right side of the perforation) */}
            <div className="tix-ticket__stub">
              <div className="tix-ticket__price-block">
                <span className="tix-ticket__currency">$</span>
                <span className="tix-ticket__price">{ticket.price}</span>
              </div>
              {ticket.originalPrice && (
                <span className="tix-ticket__original">
                  ${ticket.originalPrice}
                </span>
              )}
              <button
                className="tix-ticket__buy-btn"
                onClick={() => state.setShowTicketCheckout(ticket)}
              >
                <Ticket size={14} strokeWidth={2} />
                Buy
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* ===== MEMBER CTA ===== */}
      {!state.isLoggedIn && (
        <section className="tix-member section">
          <div className="tix-member__card">
            <div className="tix-member__glow" />
            <div className="tix-member__content">
              <Sparkles
                size={18}
                strokeWidth={1.8}
                className="tix-member__icon"
              />
              <h3 className="tix-member__title">Free unlimited admission</h3>
              <p className="tix-member__text">
                Members enjoy free entry all year + exclusive events
              </p>
              <button
                className="tix-member__btn"
                onClick={() => state.showToast("Sign in coming soon")}
              >
                Become a Member
                <ArrowRight size={14} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ===== INFO ===== */}
      <section className="tix-info section">
        <div className="tix-info__row">
          <Info size={14} strokeWidth={2} />
          <span>Free for children under 12</span>
        </div>
        <div className="tix-info__row">
          <Info size={14} strokeWidth={2} />
          <span>ID required for NY residents</span>
        </div>
        <div className="tix-info__row">
          <Info size={14} strokeWidth={2} />
          <span>Refunds up to 24h before visit</span>
        </div>
      </section>
    </div>
  );
}

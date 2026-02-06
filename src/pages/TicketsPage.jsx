import React, { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Calendar,
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
  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const isUnavailable = i === 4;
    days.push({
      dayName: dayNames[date.getDay()],
      dateNum: date.getDate(),
      month: monthNames[date.getMonth()],
      isToday: i === 0,
      isUnavailable,
      key: date.toISOString(),
      isoDate: date.toISOString().slice(0, 10),
    });
  }
  return days;
}

export default function TicketsPage({ state }) {
  const { setScreenStatus } = state;
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState("10:30 AM");
  const datePills = useMemo(() => generateNextSevenDays(), []);
  const selectedVisitDate = datePills[selectedDate];
  const timeOptions = useMemo(() => ["10:30 AM", "12:00 PM", "2:30 PM", "4:00 PM"], []);
  const isUnavailable = Boolean(selectedVisitDate?.isUnavailable);

  useEffect(() => {
    if (isUnavailable) {
      setScreenStatus("tickets", "empty");
      return;
    }

    setScreenStatus("tickets", "success");
  }, [isUnavailable, setScreenStatus]);

  const openCheckout = (ticket) => {
    if (!selectedVisitDate) {
      return;
    }

    state.setShowTicketCheckout({
      ticket,
      visitDate: selectedVisitDate.isoDate,
      timeLabel: selectedTime,
      isUnavailable,
    });
  };

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
              {day.isUnavailable && <span className="tix-date__dot" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </section>

      <section className="tix-session section">
        <div className="section-header">
          <h2>Visit Session</h2>
        </div>

        <div className={`tix-session__card${isUnavailable ? " tix-session__card--warn" : ""}`}>
          <div className="tix-session__line">
            <Calendar size={14} strokeWidth={2} />
            <span>
              {selectedVisitDate?.isToday ? "Today" : `${selectedVisitDate?.dayName}, ${selectedVisitDate?.month} ${selectedVisitDate?.dateNum}`}
            </span>
          </div>
          <div className="tix-time-pills">
            {timeOptions.map((timeLabel) => (
              <button
                key={timeLabel}
                className={`tix-time-pill${selectedTime === timeLabel ? " tix-time-pill--active" : ""}`}
                onClick={() => setSelectedTime(timeLabel)}
              >
                {timeLabel}
              </button>
            ))}
          </div>
          {isUnavailable && (
            <p className="tix-session__warning">
              Selected day is fully booked. Choose another date to continue.
            </p>
          )}
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
                onClick={() => openCheckout(ticket)}
                disabled={isUnavailable}
              >
                <Ticket size={14} strokeWidth={2} />
                {isUnavailable ? "Unavailable" : "Buy"}
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
                onClick={() => {
                  state.setActiveTab("profile");
                  state.showToast("Sign in to unlock membership perks.");
                }}
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

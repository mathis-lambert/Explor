function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function simulateDelay(min = 300, max = 900) {
  const duration = randomBetween(min, max);
  await new Promise((resolve) => setTimeout(resolve, duration));
}

export async function simulateRouteOutcome(route) {
  await simulateDelay(420, 980);

  if (Math.random() < 0.16) {
    throw new Error("Route generation temporarily unavailable");
  }

  return {
    ...route,
    generatedAt: new Date().toISOString(),
  };
}

export async function simulateTicketPurchase({
  session,
  quantity,
  selectedTimeLabel,
}) {
  await simulateDelay(520, 1200);

  if (session?.isUnavailable) {
    return {
      status: "unavailable",
      reason: "This date is fully booked.",
    };
  }

  if (Math.random() < 0.22) {
    return {
      status: "declined",
      reason: "Card authorization could not be completed.",
    };
  }

  const confirmationCode = `EX-${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    status: "success",
    confirmationCode,
    quantity,
    selectedTimeLabel,
    purchasedAt: new Date().toISOString(),
    session,
  };
}

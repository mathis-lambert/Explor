const MET_API_BASE_URL =
  import.meta.env.VITE_MET_API_BASE_URL ||
  (import.meta.env.DEV
    ? "/met-api"
    : "https://collectionapi.metmuseum.org/public/collection/v1");
const DEFAULT_QUERY = "art";
const REQUEST_BATCH_SIZE = 12;

const departmentsCache = {
  value: null,
};

const objectCache = new Map();

function buildSearchQuery({
  query = DEFAULT_QUERY,
  departmentId,
  hasImages = true,
  isHighlight = false,
}) {
  const params = new URLSearchParams();
  params.set("q", (query || DEFAULT_QUERY).trim() || DEFAULT_QUERY);

  if (hasImages) {
    params.set("hasImages", "true");
  }

  if (isHighlight) {
    params.set("isHighlight", "true");
  }

  if (departmentId) {
    params.set("departmentId", String(departmentId));
  }

  return params.toString();
}

async function fetchJson(path, signal) {
  const response = await fetch(`${MET_API_BASE_URL}${path}`, { signal });

  if (!response.ok) {
    throw new Error(`Met API request failed with status ${response.status}`);
  }

  return response.json();
}

function formatArtistName(objectData) {
  if (objectData.artistDisplayName) {
    return objectData.artistDisplayName;
  }

  if (Array.isArray(objectData.constituents) && objectData.constituents.length) {
    return objectData.constituents
      .map((constituent) => constituent.name)
      .filter(Boolean)
      .join(", ");
  }

  if (objectData.culture) {
    return objectData.culture;
  }

  return "Unknown Artist";
}

function formatDescription(objectData) {
  const parts = [objectData.objectName, objectData.classification, objectData.creditLine]
    .filter(Boolean)
    .slice(0, 3);

  if (parts.length === 0) {
    return "";
  }

  return parts.join(" \u2022 ");
}

function mapMetObjectToArtwork(objectData) {
  if (!objectData || !objectData.objectID) {
    return null;
  }

  const primaryImage = objectData.primaryImageSmall || objectData.primaryImage;
  if (!primaryImage) {
    return null;
  }

  const tags = Array.isArray(objectData.tags)
    ? objectData.tags.map((tag) => tag.term).filter(Boolean).slice(0, 8)
    : [];

  if (objectData.classification && !tags.includes(objectData.classification)) {
    tags.unshift(objectData.classification);
  }

  return {
    id: objectData.objectID,
    title: objectData.title || "Untitled",
    artist: formatArtistName(objectData),
    date: objectData.objectDate || "",
    department: objectData.department || "",
    medium: objectData.medium || "",
    dimensions: objectData.dimensions || "",
    gallery: objectData.GalleryNumber || "",
    image: primaryImage,
    gallery_images: Array.isArray(objectData.additionalImages)
      ? objectData.additionalImages.slice(0, 10)
      : [],
    description: formatDescription(objectData),
    tags,
    sourceUrl: objectData.objectURL || "",
  };
}

export async function fetchDepartments(signal) {
  if (departmentsCache.value) {
    return departmentsCache.value;
  }

  const payload = await fetchJson("/departments", signal);
  const departments = Array.isArray(payload.departments) ? payload.departments : [];
  departmentsCache.value = departments;
  return departments;
}

export async function searchObjects({
  query = DEFAULT_QUERY,
  departmentId,
  hasImages = true,
  isHighlight = false,
  signal,
} = {}) {
  const queryString = buildSearchQuery({
    query,
    departmentId,
    hasImages,
    isHighlight,
  });

  const payload = await fetchJson(`/search?${queryString}`, signal);

  return {
    total: payload.total || 0,
    objectIDs: Array.isArray(payload.objectIDs) ? payload.objectIDs : [],
  };
}

export async function fetchObject(objectId, { signal } = {}) {
  if (!objectId) {
    return null;
  }

  if (objectCache.has(objectId)) {
    return objectCache.get(objectId);
  }

  const objectPromise = fetchJson(`/objects/${objectId}`, signal)
    .then((payload) => mapMetObjectToArtwork(payload))
    .catch((error) => {
      objectCache.delete(objectId);
      throw error;
    });

  objectCache.set(objectId, objectPromise);
  return objectPromise;
}

export async function fetchObjectsByIds(objectIDs, { limit, signal } = {}) {
  if (!Array.isArray(objectIDs) || objectIDs.length === 0) {
    return [];
  }

  const seen = new Set();
  const uniqueIds = objectIDs.filter((id) => {
    if (seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });

  const effectiveLimit = limit ? Math.max(1, limit) : uniqueIds.length;
  const cappedIds = uniqueIds.slice(0, Math.max(effectiveLimit * 4, effectiveLimit));
  const artworks = [];

  for (let i = 0; i < cappedIds.length && artworks.length < effectiveLimit; i += REQUEST_BATCH_SIZE) {
    const batch = cappedIds.slice(i, i + REQUEST_BATCH_SIZE);
    const responses = await Promise.allSettled(
      batch.map((objectId) => fetchObject(objectId, { signal })),
    );

    for (const response of responses) {
      if (response.status === "fulfilled" && response.value) {
        artworks.push(response.value);
      }

      if (response.status === "rejected" && response.reason?.name === "AbortError") {
        throw response.reason;
      }

      if (artworks.length >= effectiveLimit) {
        break;
      }
    }
  }

  return artworks.slice(0, effectiveLimit);
}

export async function searchArtworks({
  query = DEFAULT_QUERY,
  departmentId,
  limit = 24,
  isHighlight = false,
  signal,
} = {}) {
  const { total, objectIDs } = await searchObjects({
    query,
    departmentId,
    hasImages: true,
    isHighlight,
    signal,
  });

  const artworks = await fetchObjectsByIds(objectIDs, { limit, signal });

  return { total, artworks };
}

export async function fetchFeaturedArtworks({ limit = 10, signal } = {}) {
  const highlightResults = await searchArtworks({
    query: "masterpiece",
    isHighlight: true,
    limit,
    signal,
  });

  if (highlightResults.artworks.length >= limit) {
    return highlightResults.artworks.slice(0, limit);
  }

  const fallbackResults = await searchArtworks({
    query: "painting",
    limit: limit * 2,
    signal,
  });

  const merged = [...highlightResults.artworks];
  const used = new Set(merged.map((artwork) => artwork.id));

  for (const artwork of fallbackResults.artworks) {
    if (!used.has(artwork.id)) {
      merged.push(artwork);
      used.add(artwork.id);
    }

    if (merged.length >= limit) {
      break;
    }
  }

  return merged.slice(0, limit);
}

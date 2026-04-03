function resolveApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const { hostname } = window.location;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://127.0.0.1:8000/api";
    }
  }

  return "https://api.drdeeptientdelhi.in/api";
}

export async function apiFetch(path, options = {}) {
  const baseUrl = resolveApiBaseUrl();
  const url = `${baseUrl}${path}`;
  const requestHeaders = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  let response;

  try {
    response = await fetch(url, {
      credentials: "include",
      ...options,
      headers: requestHeaders,
    });
  } catch {
    throw {
      error: "Could not reach the clinic server. Please try again in a moment.",
    };
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw data || { error: "Request failed" };
  }

  return data;
}

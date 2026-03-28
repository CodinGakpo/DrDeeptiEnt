export async function apiFetch(path, options = {}) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is not defined");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    credentials: "include", // future-proof for session auth
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw data || { error: "Request failed" };
  }

  return data;
}

const API_BASE_URL = "http://localhost:5000/api";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "حدث خطأ في الاتصال بالخادم");
    }

    return await response.json();
  } catch (error: any) {
    console.error(`API Error (${endpoint}):`, error.message);
    throw error;
  }
}

// دالات مساعدة سريعة
export const api = {
  getStats: () => fetchApi("/dashboard/stats"),
  getAccounts: () => fetchApi("/accounts"),
  getInventory: () => fetchApi("/inventory"),
  createInvoice: (data: any) => fetchApi("/invoices", { method: "POST", body: JSON.stringify(data) }),
  createPayment: (data: any) => fetchApi("/payments", { method: "POST", body: JSON.stringify(data) }),
};

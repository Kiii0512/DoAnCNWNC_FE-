export async function callLogoutAPI() {
  const refreshToken = localStorage.getItem("refreshtoken");
  const accessToken = localStorage.getItem("accesstoken");
  if (!refreshToken) return;

  await fetch("https://localhost:7155/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(refreshToken)
  });
}

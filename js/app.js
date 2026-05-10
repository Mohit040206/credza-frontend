async function login() {
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;

  const res = await fetch("https://credza-backend.onrender.com/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ phone, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    window.location.href = "dashboard.html";
  } else {
    alert(data.message);
  }
}


async function loadCustomers() {
  const res = await fetch("https://credza-backend.onrender.com/api/customer", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  const data = await res.json();

  const container = document.getElementById("customerList");
  container.innerHTML = "";

  data.data.forEach(c => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p>${c.name} - ${c.phone}</p>
      <button onclick="viewLedger('${c._id}')">View</button>
    `;
    container.appendChild(div);
  });
}

window.onload = loadCustomers;
const API = "https://dummyjson.com/products";
let productsData = [];

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

const $ = (id) => document.getElementById(id);

// User Display
(function showUser() {
  const email = localStorage.getItem("Email");
  const el = $("userDisplay");
  if (email && el) el.innerText = "Hi, " + user;
})();

// Products
async function fetchProducts(limit = 12) {
  const res = await fetch(`${API}?limit=${limit}`);
  const data = await res.json();
  productsData = data.products;
  return data.products;
}

async function renderProducts(containerId, limit) {
  const box = $(containerId);
  if (!box) return;

  const products = await fetchProducts(limit);
  box.innerHTML = "";

  products.forEach((p) => {
    box.innerHTML += `
      <div class="card">
        <img src="${p.thumbnail}" alt="${p.title}">
        <div class="info">
          <h4>${p.title}</h4>
          <p class="price">PKR ${p.price * 280}</p>
          <button onclick="addToCart(${p.id})">Add to Cart</button>
          <span class="wish ${
            isInWishlist(p.id) ? "active" : ""
          }" onclick="toggleWishlist(${p.id}, this)">❤</span>
        </div>
      </div>
    `;
  });
}

// Render on home / products pages
if ($("newArrivals")) renderProducts("newArrivals", 6);
if ($("bestsellingproducts")) renderProducts("bestsellingproducts", 6);
if ($("allProducts")) renderProducts("allProducts", 12);

// Cart
function addToCart(id) {
  const product = productsData.find((p) => p.id === id);
  if (!product) return;

  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart");
  showCart();
}

function showCart() {
  const box = $("cartItems");
  const totalEl = $("cartTotal");
  if (!box || !totalEl) return;

  let total = 0;
  box.innerHTML = "";

  cart.forEach((p, i) => {
    total += p.price * 280;
    box.innerHTML += `
      <div class="cart-item">
        <img src="${p.thumbnail}" width="60">
        <div>
          <p>${p.title}</p>
          <p>PKR ${p.price * 280}</p>
          <button style="  width: 100%;
  background: #c084fc;
  color: #fff;
  padding: 10px;
  border-radius: 8px;" onclick="removeCart(${i})">Remove</button>
        </div>
      </div>
    `;
  });

  totalEl.innerText = total;
}

function removeCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  showCart();
}

function placeOrder() {
  if (!cart.length) {
    alert("Cart is empty");
    return;
  }
  alert("Order placed!");
  cart = [];
  localStorage.removeItem("cart");
  showCart();
}

// Wishlist
function isInWishlist(id) {
  return wishlist.some((p) => p.id === id);
}

function toggleWishlist(id, btn) {
  const product = productsData.find((p) => p.id === id);
  if (!product) return;

  const index = wishlist.findIndex((p) => p.id === id);

  if (index > -1) {
    wishlist.splice(index, 1);
    btn.classList.remove("active");
  } else {
    wishlist.push(product);
    btn.classList.add("active");
  }

  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  showWishlist();
}

function showWishlist() {
  const box = $("wishlistItems");
  if (!box) return;

  box.innerHTML = "";
  if (!wishlist.length) {
    box.innerHTML = "<p>No items in wishlist</p>";
    return;
  }

  wishlist.forEach((p, i) => {
    box.innerHTML += `
      <div class="cart-item">
        <img src="${p.thumbnail}" width="60">
        <div>
          <p>${p.title}</p>
          <p>PKR ${p.price * 280}</p>
          <button style="  width: 100%;
  background: #c084fc;
  color: #fff;
  padding: 10px;
  border-radius: 8px;" onclick="removeWishlist(${i})">Remove</button>
        </div>
      </div>
    `;
  });
}

function removeWishlist(index) {
  wishlist.splice(index, 1);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  showWishlist();
}

// Cart + Wishlist
if ($("cartItems")) showCart();
if ($("wishlistItems")) showWishlist();

// Authentication
function loginUser() {
  const e = $("email")?.value;
  const p = $("password")?.value;

  if (
    (e === "hasnainimam475530@gmail.com" && p === "h1234") ||
    (e === "za7081539@gmail.com" && p === "zain1234")
  ) {
    localStorage.setItem("admin", "true");
    localStorage.setItem("email", "Admin");
    location.href = "admin.html";
  } else if (e && p) {
    localStorage.setItem("email", e);
    location.href = "index.html";
  } else {
    alert("Fill all fields");
  }
}

function logoutAdmin() {
  localStorage.clear();
  location.href = "login.html";
}

// Admin Page
async function loadAdminProducts() {
  const box = $("adminProducts");
  if (!box) return;

  if (!productsData.length) {
    const res = await fetch(`${API}?limit=20`);
    const data = await res.json();
    productsData = data.products;
  }

  box.innerHTML = "";
  productsData.forEach((p) => {
    box.innerHTML += `
    <div class="admin-card">
      <img src="${p.thumbnail}" />
      <h4>${p.title}</h4>
      <p>PKR ${p.price * 280}</p>
      <div class="admin-actions">
        <button class="edit" onclick="openEditModal(${p.id})">Edit</button>
        <button class="delete" onclick="deleteProduct(${p.id})">Delete</button>
      </div>
    </div>
  `;
  });
}

function openEditModal(id) {
  if (!localStorage.getItem("admin")) {
    alert("Admin only!");
    return;
  }
  const product = productsData.find((p) => p.id === id);
  if (!product) return;

  const newTitle = prompt("Edit title:", product.title);
  const newPrice = prompt("Edit price (PKR):", product.price * 280);
  if (newTitle) product.title = newTitle;
  if (newPrice) product.price = Number(newPrice) / 280;

  alert("Product updated (demo)");
  loadAdminProducts();
}

function deleteProduct(id) {
  if (!localStorage.getItem("admin")) {
    alert("Admin only!");
    return;
  }
  if (confirm("Delete this product?")) {
    productsData = productsData.filter((p) => p.id !== id);
    alert("Product deleted (demo)");
    loadAdminProducts();
  }
}

if (location.pathname.includes("admin.html")) loadAdminProducts();
if (!localStorage.getItem("admin")) {
  document
    .querySelectorAll(".admin-btn")
    .forEach((btn) => (btn.style.display = "none"));
}
if (location.pathname.includes("admin.html")) {
  if (!localStorage.getItem("admin")) {
    alert("Admin only");
    location.href = "login.html";
  }
}

// AI Chat
function toggleChatBox() {
  const box = $("chatBox");
  if (box) box.style.display = box.style.display === "block" ? "none" : "block";
}

function sendMessage() {
  const input = $("chatInput");
  const log = $("chatLog");
  if (!input || !input.value.trim()) return;

  const q = input.value.toLowerCase();
  log.innerHTML += `<div><b>You:</b> ${input.value}</div>`;

  const found = productsData.find((p) => q.includes(p.title.toLowerCase()));

  if (found) {
    log.innerHTML += `<div><b>AI:</b> ${found.title} price is PKR ${
      found.price * 280
    }</div>`;
  } else {
    log.innerHTML += `<div><b>AI:</b> Please ask with product name.</div>`;
  }

  input.value = "";
  log.scrollTop = log.scrollHeight;
}

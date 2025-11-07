// Basic data model for pizzas
const PIZZAS = [
  { id: 1, name: "Margherita", price: 249, veg: true, spicy: false, img: "assets/p-margherita.jpg", desc: "Tomato, fresh mozzarella, basil." },
  { id: 2, name: "Farmhouse Veg", price: 329, veg: true, spicy: false, img: "assets/p-farmhouse.jpg", desc: "Onions, capsicum, corn, mushrooms." },
  { id: 3, name: "Paneer Tikka", price: 359, veg: true, spicy: true, img: "assets/p-paneer.jpg", desc: "Paneer tikka, peppers, onions, cilantro." },
  { id: 4, name: "Pepperoni", price: 399, veg: false, spicy: false, img: "assets/p-pepperoni.jpg", desc: "Classic pepperoni, mozzarella." },
  { id: 5, name: "Chicken Supreme", price: 429, veg: false, spicy: true, img: "assets/p-chicken.jpg", desc: "Chicken, jalapeños, onions, BBQ drizzle." },
  { id: 6, name: "Veggie Supreme", price: 349, veg: true, spicy: false, img: "assets/p-veggie.jpg", desc: "Olives, tomatoes, peppers, onions." },
  { id: 7, name: "Spicy Sausage", price: 439, veg: false, spicy: true, img: "assets/p-sausage.jpg", desc: "Sausage, chilies, garlic oil." },
  { id: 8, name: "Four Cheese", price: 379, veg: true, spicy: false, img: "assets/p-4cheese.jpg", desc: "Mozzarella, cheddar, parmesan, blue." },
  { id: 9, name: "Hawaiian", price: 389, veg: false, spicy: false, img: "assets/p-hawaiian.jpg", desc: "Chicken ham, pineapple, mozzarella." }
];

let cart = JSON.parse(localStorage.getItem("bp_cart") || "[]");
let filter = "all";
let search = "";

// Elements
const menuGrid = document.getElementById("menuGrid");
const cartItems = document.getElementById("cartItems");
const subtotalEl = document.getElementById("subtotal");
const deliveryEl = document.getElementById("delivery");
const deliveryLabel = document.getElementById("deliveryLabel");
const grandTotalEl = document.getElementById("grandTotal");
const drawerItems = document.getElementById("drawerItems");
const drawerSubtotal = document.getElementById("drawerSubtotal");
const drawerTotal = document.getElementById("drawerTotal");
const cartCount = document.getElementById("cartCount");
const orderStatus = document.getElementById("orderStatus");

document.getElementById("year").textContent = new Date().getFullYear();

// Render menu
function renderMenu() {
  const list = PIZZAS.filter(p => {
    const keepFilter =
      filter === "all" ||
      (filter === "veg" && p.veg) ||
      (filter === "nonveg" && !p.veg) ||
      (filter === "spicy" && p.spicy);
    const keepSearch = !search || p.name.toLowerCase().includes(search) || p.desc.toLowerCase().includes(search);
    return keepFilter && keepSearch;
  });

  menuGrid.innerHTML = list.map(p => `
    <article class="card" data-id="${p.id}">
      <img src="${p.img}" alt="${p.name}">
      <div class="card-body">
        <div class="card-title">${p.name}</div>
        <div class="card-meta">
          ${p.veg ? "Veg" : "Non-veg"} • ${p.spicy ? "Spicy" : "Mild"}
        </div>
        <p>${p.desc}</p>
        <div class="card-actions">
          <span class="price">₹${p.price}</span>
          <button class="btn btn-primary" data-add="${p.id}">Add to cart</button>
        </div>
      </div>
    </article>
  `).join("");
}
renderMenu();

// Filters
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    filter = chip.dataset.filter;
    renderMenu();
  });
});

// Search
document.getElementById("searchInput").addEventListener("input", e => {
  search = e.target.value.toLowerCase();
  renderMenu();
});

// Add to cart
menuGrid.addEventListener("click", e => {
  const id = e.target.dataset.add;
  if (!id) return;
  const item = PIZZAS.find(p => p.id === Number(id));
  const existing = cart.find(c => c.id === item.id);
  if (existing) existing.qty += 1;
  else cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
  persistCart();
  renderCart();
  openDrawer();
});

// Cart helpers
function persistCart() { localStorage.setItem("bp_cart", JSON.stringify(cart)); }
function cartTotals() {
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const delivery = subtotal >= 499 ? 0 : 39;
  const total = subtotal + delivery;
  return { subtotal, delivery, total };
}

// Render cart in order section and drawer
function renderCart() {
  cartItems.innerHTML = cart.map(i => `
    <div class="cart-item">
      <div class="name">${i.name}</div>
      <div>₹${i.price}</div>
      <div class="qty">
        <button data-dec="${i.id}">–</button>
        <span>${i.qty}</span>
        <button data-inc="${i.id}">+</button>
      </div>
      <button class="icon-btn" data-rem="${i.id}" aria-label="Remove">✕</button>
    </div>
  `).join("");

  drawerItems.innerHTML = cartItems.innerHTML;

  const { subtotal, delivery, total } = cartTotals();
  subtotalEl.textContent = subtotal;
  deliveryEl.textContent = delivery;
  grandTotalEl.textContent = total;
  drawerSubtotal.textContent = subtotal;
  drawerTotal.textContent = total;
  cartCount.textContent = cart.reduce((s, i) => s + i.qty, 0);

  deliveryLabel.style.opacity = cart.length ? 1 : 0.6;
}
renderCart();

// Cart actions
document.getElementById("clearCart").addEventListener("click", () => { cart = []; persistCart(); renderCart(); });
document.getElementById("drawerClear").addEventListener("click", () => { cart = []; persistCart(); renderCart(); });

function changeQty(id, delta) {
  const item = cart.find(i => i.id === Number(id));
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== item.id);
  persistCart();
  renderCart();
}

document.addEventListener("click", e => {
  if (e.target.dataset.inc) changeQty(e.target.dataset.inc, +1);
  if (e.target.dataset.dec) changeQty(e.target.dataset.dec, -1);
  if (e.target.dataset.rem) { cart = cart.filter(i => i.id !== Number(e.target.dataset.rem)); persistCart(); renderCart(); }
});

// Drawer
const drawer = document.getElementById("cartDrawer");
const openBtn = document.getElementById("openCart");
const closeBtn = document.getElementById("closeCart");
const backdrop = document.getElementById("drawerBackdrop");
function openDrawer() { drawer.setAttribute("aria-hidden", "false"); }
function closeDrawer() { drawer.setAttribute("aria-hidden", "true"); }
openBtn.addEventListener("click", openDrawer);
closeBtn.addEventListener("click", closeDrawer);
backdrop.addEventListener("click", closeDrawer);
document.getElementById("goCheckout").addEventListener("click", closeDrawer);

// Checkout
document.getElementById("checkoutForm").addEventListener("submit", e => {
  e.preventDefault();
  if (!cart.length) { orderStatus.textContent = "Your cart is empty."; return; }

  const data = Object.fromEntries(new FormData(e.target).entries());
  const { subtotal, delivery, total } = cartTotals();

  // Simulate order placement (replace with API call)
  const order = {
    id: "BP-" + Math.floor(Math.random() * 900000 + 100000),
    items: cart,
    totals: { subtotal, delivery, total },
    customer: data,
    time: new Date().toISOString()
  };

  console.log("Order placed:", order);
  orderStatus.textContent = `Order ${order.id} placed! We’ll confirm shortly. Total: ₹${total}`;
  cart = [];
  persistCart();
  renderCart();
  e.target.reset();
});

// Misc
document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });

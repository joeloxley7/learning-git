let showAnimation = true;

const products = [
  { id: 1, name: "Apples", description: "Fresh red apples · 1 kg", price: 4.50, emoji: "🍎" },
  { id: 2, name: "Bananas", description: "Ripe bananas · 1 kg", price: 3.20, emoji: "🍌" },
  { id: 3, name: "Milk", description: "Fresh dairy milk · 2 L", price: 4.80, emoji: "🥛" },
  { id: 4, name: "Bread", description: "Wholemeal loaf · 700 g", price: 3.90, emoji: "🍞" },
  { id: 5, name: "Eggs", description: "Free-range eggs · 12 pack", price: 8.50, emoji: "🥚" },
  { id: 6, name: "Carrots", description: "Crunchy carrots · 1 kg", price: 2.80, emoji: "🥕" },
  { id: 7, name: "Cheese", description: "Cheddar cheese · 500 g", price: 7.90, emoji: "🧀" },
  { id: 8, name: "Broccoli", description: "Fresh broccoli · each", price: 2.50, emoji: "🥦" }
];

const cart = {};

function formatPrice(amount) {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD"
  }).format(amount);
}

function initHeaderAnimation() {
  const header = document.querySelector("header");
  if (header) {
    header.style.animation = showAnimation ? "headerGradient 8s ease infinite" : "none";
  }
}

function toggleAnimation() {
  showAnimation = !showAnimation;
  initHeaderAnimation();
  const btn = document.getElementById("animation-toggle-btn");
  if (btn) {
    btn.textContent = showAnimation ? "🎨 Turn Animation Off" : "🎨 Turn Animation On";
  }
}

function displayProducts() {
  const productList = document.getElementById("product-list");
  let html = "";
  for (let i = 0; i < products.length; i++) {
    let product = products[i];
    html += `
      <article class="product">
        <div class="product-emoji" aria-hidden="true">${product.emoji}</div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="price">${formatPrice(product.price)}</div>
        <button type="button" onclick="addToCart(${product.id})">Add to Cart</button>
      </article>
    `;
  }
  productList.innerHTML = html;
}

function addToCart(productId) {
  cart[productId] = (cart[productId] || 0) + 1;
  updateCart();
  document.getElementById("order-message").className = "message";
  document.getElementById("order-message").textContent = "";
}

function removeFromCart(productId) {
  delete cart[productId];
  updateCart();
}

function updateCart() {
  const cartItems = document.getElementById("cart-items");
  const cartKeys = Object.keys(cart);
  
  let cartCount = 0;
  let i = 0;
  while (i < cartKeys.length) {
    cartCount += cart[cartKeys[i]];
    i++;
  }

  let total = 0;
  for (let j = 0; j < products.length; j++) {
    let product = products[j];
    if (cart[product.id]) {
      total += product.price * cart[product.id];
    }
  }

  document.getElementById("cart-count").textContent = cartCount;
  document.getElementById("cart-total").textContent = formatPrice(total);

  let selectedProducts = [];
  for (let k = 0; k < products.length; k++) {
    if (cart[products[k].id]) {
      selectedProducts.push(products[k]);
    }
  }

  if (selectedProducts.length === 0) {
    cartItems.innerHTML = '<p class="empty">Your cart is empty. Add some groceries to get started.</p>';
    return;
  }

  let html = "";
  let m = 0;
  while (m < selectedProducts.length) {
    let product = selectedProducts[m];
    html += `
      <div class="cart-row">
        <div>
          <div class="cart-item-name">${product.emoji} ${product.name} × ${cart[product.id]}</div>
          <div class="cart-item-detail">${formatPrice(product.price)} each · ${formatPrice(product.price * cart[product.id])}</div>
        </div>
        <button type="button" class="remove-btn" onclick="removeFromCart(${product.id})" aria-label="Remove ${product.name} from cart">Remove</button>
      </div>
    `;
    m++;
  }
  cartItems.innerHTML = html;
}

function placeOrder(event) {
  event.preventDefault();

  const message = document.getElementById("order-message");
  const cartKeys = Object.keys(cart);
  
  let cartCount = 0;
  let i = 0;
  while (i < cartKeys.length) {
    cartCount += cart[cartKeys[i]];
    i++;
  }

  if (cartCount === 0) {
    message.className = "message error";
    message.textContent = "Please add at least one grocery item before placing your order.";
    return;
  }

  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const customerName = document.getElementById("customer-name").value.trim();
  const customerAddress = document.getElementById("customer-address").value.trim();
  const customerEmail = document.getElementById("customer-email").value.trim();

  // Email Regex Validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(customerEmail)) {
    message.className = "message error";
    message.textContent = "Please enter a valid email address format.";
    return;
  }

  let total = 0;
  let orderBody = `Fresh Bites Order Summary\n\nCustomer: ${customerName}\nAddress: ${customerAddress}\nEmail: ${customerEmail}\n\nItems Ordered:\n`;
  
  for (let j = 0; j < products.length; j++) {
    let product = products[j];
    if (cart[product.id]) {
      let itemTotal = product.price * cart[product.id];
      total += itemTotal;
      orderBody += `- ${product.name} × ${cart[product.id]} (${formatPrice(itemTotal)})\n`;
    }
  }
  orderBody += `\nTotal: ${formatPrice(total)}`;

  message.className = "message success";
  message.textContent = `Thank you, ${customerName}! Your demo order for ${formatPrice(total)} has been placed. Opening Gmail compose...`;

  // Open Gmail correctly in browser
  const storeEmail = "orders@freshbites.co.nz"; // Store destination address
  const subject = "Fresh Bites Order Confirmation - " + customerName;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(storeEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(orderBody)}`;
  
  window.open(gmailUrl, "_blank");

  let keysToClear = Object.keys(cart);
  let k = 0;
  while (k < keysToClear.length) {
    delete cart[keysToClear[k]];
    k++;
  }
  
  updateCart();
  form.reset();
}

document.getElementById("checkout-form").addEventListener("submit", placeOrder);

initHeaderAnimation();
displayProducts();
updateCart();
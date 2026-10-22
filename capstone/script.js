
"use strict";

// LuxeStock — Smart Inventory & Sales Manager

const LOW_STOCK_LIMIT = 5;

const defaultProducts = [
  { id: 1, name: "Laptop", price: 800, quantity: 8 },
  { id: 2, name: "Mouse", price: 25, quantity: 3 },
  { id: 3, name: "Keyboard", price: 45, quantity: 12 },
  { id: 4, name: "Monitor", price: 150, quantity: 6 },
  { id: 5, name: "Premium Headphones", price: 350, quantity: 4 }
];

let products = loadProducts();

const $ = (id) => document.getElementById(id);

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(amount);

function loadProducts() {
  try {
    const saved = localStorage.getItem("luxestock-products");

    if (saved !== null) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Saved inventory could not be loaded.", error);
  }

  return defaultProducts.map(product => ({ ...product }));
}

function saveProducts() {
  try {
    localStorage.setItem("luxestock-products", JSON.stringify(products));
  } catch (error) {
    console.warn("Inventory could not be saved in this browser.", error);
  }
}

function getCategory(price) {
  if (price <= 50) return "Budget";
  if (price <= 200) return "Standard";
  return "Premium";
}

function getStockStatus(quantity) {
  if (quantity === 0) {
    return { label: "Out of stock", className: "status-out" };
  }

  if (quantity <= LOW_STOCK_LIMIT) {
    return { label: "Low stock", className: "status-low" };
  }

  return { label: "In stock", className: "status-ok" };
}

// Update dashboard summary cards
function updateDashboard() {
  const totalProducts = products.length;

  const totalUnits = products.reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  const inventoryValue = products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );

  const lowStockCount = products.filter(
    product => product.quantity <= LOW_STOCK_LIMIT
  ).length;

  $("totalProducts").textContent = totalProducts;
  $("totalUnits").textContent = totalUnits;
  $("inventoryValue").textContent = money(inventoryValue);
  $("lowStockCount").textContent = lowStockCount;
}

// Render product table based on search and selected category
function renderProducts() {
  const searchTerm = $("searchInput").value.trim().toLowerCase();
  const selectedCategory = $("categoryFilter").value;

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm);
    const matchesCategory =
      selectedCategory === "All" ||
      getCategory(product.price) === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const tbody = $("productTableBody");
  tbody.replaceChildren();

  if (filteredProducts.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 7;
    cell.className = "empty-state";
    cell.textContent = "No matching products found.";

    row.appendChild(cell);
    tbody.appendChild(row);
  }

  filteredProducts.forEach(product => {
    const row = document.createElement("tr");
    const category = getCategory(product.price);
    const status = getStockStatus(product.quantity);

    const nameCell = document.createElement("td");
    const name = document.createElement("div");
    name.className = "product-name";
    name.textContent = product.name;

    const subtitle = document.createElement("div");
    subtitle.className = "product-subtitle";
    subtitle.textContent = `Product ID: ${product.id}`;

    nameCell.append(name, subtitle);

    const categoryCell = document.createElement("td");
    const categoryPill = document.createElement("span");
    categoryPill.className = `category-pill category-${category}`;
    categoryPill.textContent = category;
    categoryCell.appendChild(categoryPill);

    const priceCell = document.createElement("td");
    priceCell.textContent = money(product.price);

    const quantityCell = document.createElement("td");
    quantityCell.textContent = product.quantity;

    const valueCell = document.createElement("td");
    valueCell.textContent = money(product.price * product.quantity);

    const statusCell = document.createElement("td");
    const statusPill = document.createElement("span");
    statusPill.className = `status-pill ${status.className}`;
    statusPill.textContent = status.label;
    statusCell.appendChild(statusPill);

    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.className = "action-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Remove";
    deleteButton.setAttribute(
      "aria-label",
      `Remove ${product.name}`
    );

    deleteButton.addEventListener("click", () => {
      removeProduct(product.id);
    });

    actionCell.appendChild(deleteButton);

    row.append(
      nameCell,
      categoryCell,
      priceCell,
      quantityCell,
      valueCell,
      statusCell,
      actionCell
    );

    tbody.appendChild(row);
  });

  $("productCountLabel").textContent =
    `${filteredProducts.length} of ${products.length} products`;
}

// Render category breakdown
function renderCategories() {
  const container = $("categoryBreakdown");
  container.replaceChildren();

  const categories = ["Budget", "Standard", "Premium"];

  const counts = categories.map(category => ({
    name: category,
    count: products.filter(
      product => getCategory(product.price) === category
    ).length
  }));

  const maxCount = Math.max(1, ...counts.map(item => item.count));

  counts.forEach(item => {
    const row = document.createElement("div");
    row.className = "category-row";

    const top = document.createElement("div");
    top.className = "category-row-top";

    const label = document.createElement("span");
    label.textContent = item.name;

    const count = document.createElement("span");
    count.textContent = `${item.count} product${item.count === 1 ? "" : "s"}`;

    top.append(label, count);

    const track = document.createElement("div");
    track.className = "bar-track";

    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = `${(item.count / maxCount) * 100}%`;

    track.appendChild(fill);
    row.append(top, track);
    container.appendChild(row);
  });
}

function refreshDashboard() {
  updateDashboard();
  renderProducts();
  renderCategories();
}

// Add a product
function addProduct(event) {
  event.preventDefault();

  const name = $("productName").value.trim();
  const price = Number($("productPrice").value);
  const quantity = Number($("productQuantity").value);
  const selectedCategory = $("productCategory").value;
  const message = $("formMessage");

  if (!name) {
    message.textContent = "Please enter a product name.";
    return;
  }

  if (!Number.isFinite(price) || price <= 0) {
    message.textContent = "Enter a valid price greater than zero.";
    return;
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    message.textContent = "Quantity must be a whole number, zero or higher.";
    return;
  }

  const duplicate = products.some(
    product => product.name.toLowerCase() === name.toLowerCase()
  );

  if (duplicate) {
    message.textContent = "A product with this name already exists.";
    return;
  }

  const product = {
    id: Date.now(),
    name,
    price,
    quantity
  };

  // Categories are automatically determined by the pricing rules.
  // The dropdown allows the user to preview the category choice;
  // the product's category is always calculated consistently from price.
  const category = getCategory(product.price);

  products.push(product);
  saveProducts();
  refreshDashboard();

  $("productForm").reset();
  $("productCategory").value = "auto";

  message.textContent =
    `${name} added successfully to the ${category} category.`;

  console.log("New product added:", {
    name,
    price,
    quantity,
    category
  });
}

// Remove a product
function removeProduct(id) {
  const product = products.find(item => item.id === id);

  if (!product) return;

  const confirmed = window.confirm(
    `Remove "${product.name}" from your inventory?`
  );

  if (!confirmed) return;

  products = products.filter(item => item.id !== id);

  saveProducts();
  refreshDashboard();

  $("formMessage").textContent =
    `${product.name} has been removed.`;

  console.log("Product removed:", product.name);
}

// Discount is applied first, then tax is calculated on the discounted amount.
function calculateSale(event) {
  if (event) event.preventDefault();

  const amount = Number($("saleAmount").value);
  const discountRate = Number($("discountRate").value);
  const taxRate = Number($("taxRate").value);

  if (
    !Number.isFinite(amount) ||
    !Number.isFinite(discountRate) ||
    !Number.isFinite(taxRate) ||
    amount < 0 ||
    discountRate < 0 ||
    discountRate > 100 ||
    taxRate < 0 ||
    taxRate > 100
  ) {
    $("saleBreakdown").textContent =
      "Enter valid amounts and percentages (0–100).";
    $("saleTotal").textContent = "—";
    return;
  }

  const discount = amount * discountRate / 100;
  const discountedAmount = amount - discount;
  const tax = discountedAmount * taxRate / 100;
  const finalTotal = discountedAmount + tax;

  $("saleTotal").textContent = money(finalTotal);
  $("saleBreakdown").textContent =
    `Discount: ${money(discount)} · Tax: ${money(tax)}`;

  console.log("Sales calculation:", {
    originalAmount: amount,
    discount,
    discountedAmount,
    tax,
    finalTotal
  });
}

// Connect event listeners
$("productForm").addEventListener("submit", addProduct);
$("salesForm").addEventListener("submit", calculateSale);

$("searchInput").addEventListener("input", renderProducts);
$("categoryFilter").addEventListener("change", renderProducts);

function showAddProductForm() {
  $("addProductSection").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  $("productName").focus({ preventScroll: true });
}

$("addProductTop").addEventListener("click", showAddProductForm);
$("addProductButton").addEventListener("click", showAddProductForm);

// Highlight the current navigation section
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(item => {
      item.classList.remove("active");
    });

    link.classList.add("active");
  });
});

// Initial render
refreshDashboard();
calculateSale();

console.log("LuxeStock initialized successfully.");
console.log("Starting inventory:", products);
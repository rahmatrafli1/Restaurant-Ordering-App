import { menuArray } from "./data.js";

const menuListEl = document.getElementById("menu-list");
const orderPanelEl = document.getElementById("order-panel");
const orderItemsEl = document.getElementById("order-items");
const orderTotalsEl = document.getElementById("order-totals");
const paymentModalEl = document.getElementById("payment-modal");
const paymentFormEl = document.getElementById("payment-form");
const completeOrderBtnEl = document.getElementById("complete-order-btn");
const feedbackContainerEl = document.getElementById("feedback-container");

const orderItems = [];
let selectedRating = 0;

const mealDeal = {
  name: "Trio deal",
  amount: 5,
  requiredIds: [0, 1, 2],
};

renderMenu();
refreshOrder();

document.addEventListener("click", (event) => {
  const addBtn = event.target.closest("[data-add]");
  const removeBtn = event.target.closest("[data-remove-index]");
  const ratingBtn = event.target.closest("[data-rating]");

  if (addBtn) {
    const menuId = Number(addBtn.dataset.add);
    const item = menuArray.find((menuItem) => menuItem.id === menuId);

    if (item) {
      orderItems.push(item);
      refreshOrder();
    }
  }

  if (removeBtn) {
    const removeIndex = Number(removeBtn.dataset.removeIndex);
    orderItems.splice(removeIndex, 1);
    refreshOrder();
  }

  if (ratingBtn) {
    selectedRating = Number(ratingBtn.dataset.rating);
    renderRating();
  }
});

completeOrderBtnEl.addEventListener("click", () => {
  if (!orderItems.length) {
    return;
  }
  paymentModalEl.classList.remove("hidden");
});

paymentFormEl.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(paymentFormEl);
  const fullName = String(formData.get("fullName") || "").trim();
  const cardNumber = String(formData.get("cardNumber") || "").replace(
    /\s+/g,
    "",
  );
  const cvv = String(formData.get("cvv") || "").trim();

  if (!fullName || !/^\d{12,19}$/.test(cardNumber) || !/^\d{3,4}$/.test(cvv)) {
    paymentFormEl.reportValidity();
    return;
  }

  paymentModalEl.classList.add("hidden");
  paymentFormEl.reset();
  orderItems.length = 0;
  refreshOrder();
  renderSuccessMessage(fullName.split(" ")[0]);
});

function renderMenu() {
  menuListEl.innerHTML = menuArray
    .map(
      (item) => `
				<article class="menu-item">
					<span class="menu-emoji" aria-hidden="true">${item.emoji}</span>
					<div class="menu-meta">
						<h3>${item.name}</h3>
						<p>${item.ingredients.join(", ")}</p>
						<strong>$${item.price}</strong>
					</div>
					<button class="add-btn" data-add="${item.id}" aria-label="Add ${item.name}">+</button>
				</article>
			`,
    )
    .join("");
}

function refreshOrder() {
  if (!orderItems.length) {
    orderPanelEl.classList.add("hidden");
    orderItemsEl.innerHTML = "";
    orderTotalsEl.innerHTML = "";
    return;
  }

  orderPanelEl.classList.remove("hidden");

  orderItemsEl.innerHTML = orderItems
    .map(
      (item, index) => `
				<div class="order-row">
					<div class="order-row-left">
						<span class="order-name">${item.name}</span>
						<button class="remove-btn" data-remove-index="${index}">remove</button>
					</div>
					<span class="order-price">$${item.price}</span>
				</div>
			`,
    )
    .join("");

  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
  const discount = getMealDealDiscount(orderItems);
  const total = Math.max(subtotal - discount, 0);

  orderTotalsEl.innerHTML = `
		${
      discount
        ? `<div class="order-row discount-line"><span>${mealDeal.name}</span><span>-$${discount}</span></div>`
        : ""
    }
		<div class="total-line">
			<span>Total price:</span>
			<span>$${total}</span>
		</div>
	`;
}

function getMealDealDiscount(items) {
  const itemIds = new Set(items.map((item) => item.id));
  const hasAllRequiredItems = mealDeal.requiredIds.every((id) =>
    itemIds.has(id),
  );
  return hasAllRequiredItems ? mealDeal.amount : 0;
}

function renderSuccessMessage(firstName) {
  feedbackContainerEl.innerHTML = `
		<div class="feedback-box">Thanks, ${firstName}! Your order is on its way!</div>
		<div class="rating-wrap">
			<p class="rating-title">How was your experience?</p>
			<div class="stars" id="stars"></div>
			<p class="rating-note" id="rating-note">Tap a star to rate your meal.</p>
		</div>
	`;
  selectedRating = 0;
  renderRating();
}

function renderRating() {
  const starsEl = document.getElementById("stars");
  const noteEl = document.getElementById("rating-note");

  if (!starsEl || !noteEl) {
    return;
  }

  starsEl.innerHTML = [1, 2, 3, 4, 5]
    .map(
      (starValue) => `
				<button
					class="star-btn ${selectedRating >= starValue ? "active" : ""}"
					data-rating="${starValue}"
					aria-label="Rate ${starValue} star"
				>★</button>
			`,
    )
    .join("");

  noteEl.textContent = selectedRating
    ? `You rated us ${selectedRating}/5. Thank you!`
    : "Tap a star to rate your meal.";
}

const products = document.querySelectorAll('.prod');
const search = document.getElementById('search');
let activeFilter = 'all';
let galleryIndex = 0;

function getVisibleProducts() {
  return [...products].filter((product) => !product.hidden);
}

function updateGallery() {
  const galleryProducts = getVisibleProducts();
  const image = document.getElementById('gallery-image');
  const empty = document.getElementById('gallery-empty');
  const title = document.getElementById('gallery-title');
  const caption = document.getElementById('gallery-caption');
  const count = document.getElementById('gallery-count');
  const previous = document.getElementById('gallery-prev');
  const next = document.getElementById('gallery-next');
  if (!image) return;

  const hasProducts = galleryProducts.length > 0;
  image.hidden = !hasProducts;
  if (empty) empty.hidden = hasProducts;
  if (previous) previous.disabled = !hasProducts;
  if (next) next.disabled = !hasProducts;
  if (!hasProducts) {
    if (title) title.textContent = 'No matching items';
    if (caption) caption.textContent = 'Change your search or category filter to browse products.';
    if (count) count.textContent = '0 of 0';
    return;
  }

  galleryIndex = ((galleryIndex % galleryProducts.length) + galleryProducts.length) % galleryProducts.length;
  const product = galleryProducts[galleryIndex];
  image.src = product.dataset.image;
  image.alt = product.dataset.imageAlt;
  image.classList.toggle('dictionary-cover', product.dataset.name === 'dictionary');
  image.classList.toggle('image-contain', product.dataset.imageFit === 'contain');
  if (title) title.textContent = product.querySelector('h3').textContent.trim();
  if (caption) caption.textContent = product.querySelector('.description').textContent.trim();
  if (count) count.textContent = `${galleryIndex + 1} of ${galleryProducts.length}`;
}

function updateCatalog() {
  if (!search) return;
  const query = search.value.trim().toLowerCase();
  products.forEach((product) => {
    const matchesFilter = activeFilter === 'all' || product.dataset.cat === activeFilter;
    const searchableText = `${product.dataset.name} ${product.querySelector('.description').textContent} ${product.dataset.cat}`.toLowerCase();
    const matchesSearch = searchableText.includes(query);
    product.hidden = !(matchesFilter && matchesSearch);
  });
  galleryIndex = 0;
  const empty = document.getElementById('catalog-empty');
  if (empty) empty.hidden = getVisibleProducts().length > 0;
  updateGallery();
}

function validateQuantity(input, showError = false) {
  const error = document.getElementById(input.getAttribute('aria-describedby'));
  const value = input.value.trim();
  let message = '';
  let quantity = null;

  if (!value) {
    if (showError) message = 'Quantity is required. Enter a whole number from 1 to 20.';
  } else if (!/^\d+$/.test(value)) {
    message = 'Quantity must be a whole number from 1 to 20.';
  } else {
    quantity = Number(value);
    if (quantity < 1) {
      message = 'Quantity must be at least 1.';
      quantity = null;
    } else if (quantity > 20) {
      message = 'Quantity cannot exceed 20.';
      quantity = null;
    }
  }

  input.setAttribute('aria-invalid', String(Boolean(message)));
  if (error) {
    error.textContent = message;
    error.classList.toggle('is-visible', Boolean(message));
  }
  return quantity;
}

function getPrice(product) {
  return Number(product.querySelector('.p').textContent.replaceAll(',', ''));
}

function updateCart() {
  const cartItems = document.getElementById('cart-items');
  const emptyMessage = document.getElementById('cart-empty');
  const message = document.getElementById('msg');
  const entries = [];
  let total = 0;

  if (cartItems) cartItems.replaceChildren();
  products.forEach((product) => {
    const input = product.querySelector('.q');
    const quantity = validateQuantity(input, input.dataset.touched === 'true');
    if (!quantity) return;

    const lineTotal = getPrice(product) * quantity;
    total += lineTotal;
    entries.push({ product, quantity, lineTotal });

    if (cartItems) {
      const item = document.createElement('li');
      const label = document.createElement('span');
      const price = document.createElement('strong');
      item.className = 'cart-item';
      label.textContent = `${product.querySelector('h3').textContent.trim()} x ${quantity}`;
      price.textContent = `Ksh ${lineTotal.toLocaleString()}`;
      item.append(label, price);
      cartItems.append(item);
    }
  });

  if (emptyMessage) emptyMessage.hidden = entries.length > 0;
  const totalElement = document.getElementById('tot');
  if (totalElement) totalElement.textContent = total.toLocaleString();
  if (message && message.classList.contains('error')) {
    message.textContent = '';
    message.classList.remove('is-visible', 'error');
  }
  return entries;
}

document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach((item) => {
    const isActive = item === button;
    item.classList.toggle('active', isActive);
    item.setAttribute('aria-pressed', String(isActive));
  });
  updateCatalog();
}));
if (search) search.addEventListener('input', updateCatalog);
document.querySelectorAll('.q').forEach((input) => {
  input.addEventListener('input', () => {
    input.dataset.touched = 'true';
    updateCart();
  });
  input.addEventListener('blur', () => {
    input.dataset.touched = 'true';
    updateCart();
  });
});
const galleryPrevious = document.getElementById('gallery-prev');
const galleryNext = document.getElementById('gallery-next');
if (galleryPrevious) galleryPrevious.addEventListener('click', () => {
  galleryIndex -= 1;
  updateGallery();
});
if (galleryNext) galleryNext.addEventListener('click', () => {
  galleryIndex += 1;
  updateGallery();
});
updateCatalog();
updateCart();
const checkout = document.getElementById('checkout');
if (checkout) checkout.addEventListener('click', () => {
  const message = document.getElementById('msg');
  const entries = updateCart();
  const hasInvalidTouchedField = [...document.querySelectorAll('.q')].some((input) => input.dataset.touched === 'true' && input.getAttribute('aria-invalid') === 'true');
  if (hasInvalidTouchedField) {
    message.textContent = 'Fix the highlighted quantities before sending your request.';
    message.className = 'message error is-visible';
  } else if (entries.length === 0) {
    message.textContent = 'Choose a quantity from 1 to 20 for at least one item.';
    message.className = 'message error is-visible';
  } else {
    message.textContent = 'Request noted. A seller can confirm availability with you.';
    message.className = 'message success is-visible';
  }
});

const form = document.getElementById('myForm');
const showPasswords = document.getElementById('show');
if (showPasswords) showPasswords.addEventListener('change', () => {
  ['pass', 'cpass'].forEach((id) => { document.getElementById(id).type = showPasswords.checked ? 'text' : 'password'; });
});
const registrationOutput = document.getElementById('out');

function clearFieldError(input) {
  const error = document.getElementById(input.getAttribute('aria-describedby'));
  input.removeAttribute('aria-invalid');
  if (error) {
    error.textContent = '';
    error.classList.remove('is-visible');
  }
}

if (form) {
  const registrationFields = ['name', 'email', 'pass', 'cpass'].map((id) => document.getElementById(id));
  registrationFields.forEach((input) => input.addEventListener('input', () => {
    clearFieldError(input);
    if (registrationOutput) registrationOutput.classList.remove('is-visible');
  }));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const [name, email, password, confirmation] = registrationFields;
    const errors = [];
    const addError = (input, message) => errors.push({ input, message });

    if (!name.value.trim()) addError(name, 'Enter your full name.');
    if (!email.value.trim()) {
      addError(email, 'Enter your campus email address.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      addError(email, 'Enter a valid email with an @ symbol and domain, such as you@campus.ac.ke.');
    }
    if (!password.value) {
      addError(password, 'Enter a password.');
    } else if (password.value.length < 8) {
      addError(password, 'Password must be at least 8 characters long.');
    }
    if (!confirmation.value) {
      addError(confirmation, 'Confirm your password.');
    } else if (password.value !== confirmation.value) {
      addError(confirmation, 'Passwords do not match.');
    }

    registrationFields.forEach(clearFieldError);
    if (registrationOutput) registrationOutput.classList.remove('is-visible', 'error', 'success', 'is-animated');

    if (errors.length) {
      errors.forEach(({ input, message }) => {
        const error = document.getElementById(input.getAttribute('aria-describedby'));
        input.setAttribute('aria-invalid', 'true');
        if (error) {
          error.textContent = message;
          error.classList.add('is-visible');
        }
      });
      if (registrationOutput) {
        registrationOutput.textContent = `${errors[0].input.labels[0].childNodes[0].textContent.trim()}: ${errors[0].message}`;
        registrationOutput.classList.add('error', 'is-visible');
      }
      errors[0].input.focus();
      return;
    }

    if (registrationOutput) {
      registrationOutput.textContent = 'Your details passed validation. Account creation is not connected yet.';
      registrationOutput.classList.add('success', 'is-visible');
      void registrationOutput.offsetWidth;
      registrationOutput.classList.add('is-animated');
    }
  });
}
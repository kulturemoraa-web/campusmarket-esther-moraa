const products = document.querySelectorAll('.prod');
const search = document.getElementById('search');
let activeFilter = 'all';

function updateCatalog() {
  if (!search) return;
  const query = search.value.trim().toLowerCase();
  products.forEach((product) => {
    const matchesFilter = activeFilter === 'all' || product.dataset.cat === activeFilter;
    const matchesSearch = product.dataset.name.includes(query);
    product.hidden = !(matchesFilter && matchesSearch);
  });
  const visible = [...products].some((product) => !product.hidden);
  const empty = document.querySelector('.empty');
  if (!visible && !empty) document.getElementById('list').insertAdjacentHTML('beforeend', '<p class="empty">No items match that search. Try another name or category.</p>');
  if (visible && empty) empty.remove();
}

function updateTotal() {
  const total = [...products].reduce((sum, product) => {
    const quantity = Number(product.querySelector('.q').value) || 0;
    return sum + Number(product.querySelector('.p').textContent) * quantity;
  }, 0);
  const totalElement = document.getElementById('tot');
  if (totalElement) totalElement.textContent = total.toLocaleString();
}

document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach((item) => item.classList.toggle('active', item === button));
  updateCatalog();
}));
if (search) search.addEventListener('input', updateCatalog);
document.querySelectorAll('.q').forEach((input) => input.addEventListener('input', updateTotal));
const checkout = document.getElementById('checkout');
if (checkout) checkout.addEventListener('click', () => {
  const message = document.getElementById('msg');
  const total = [...products].reduce((sum, product) => sum + (Number(product.querySelector('.p').textContent) * (Number(product.querySelector('.q').value) || 0)), 0);
  message.textContent = total ? 'Request noted. A seller can confirm availability with you.' : 'Choose at least one item first.';
});

const form = document.getElementById('myForm');
const showPasswords = document.getElementById('show');
if (showPasswords) showPasswords.addEventListener('change', () => {
  ['pass', 'cpass'].forEach((id) => { document.getElementById(id).type = showPasswords.checked ? 'text' : 'password'; });
});
if (form) form.addEventListener('submit', (event) => {
  event.preventDefault();
  const password = document.getElementById('pass').value;
  const confirmation = document.getElementById('cpass').value;
  const output = document.getElementById('out');
  if (!form.checkValidity()) { output.textContent = 'Please complete each field correctly.'; output.className = 'message error'; return; }
  if (password !== confirmation) { output.textContent = 'Passwords do not match.'; output.className = 'message error'; return; }
  output.textContent = 'Account details look good. Welcome to CampusMarket.';
  output.className = 'message success';
});
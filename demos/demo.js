document.addEventListener('click', event => {
  const add = event.target.closest('.add-cart');
  if (add) {
    const cart = document.querySelector('[data-cart]');
    cart.textContent = Number(cart.textContent) + 1;
    add.textContent = '✓';
    setTimeout(() => add.textContent = '+', 700);
  }

  const filter = event.target.closest('.filter');
  if (filter) {
    document.querySelectorAll('.filter').forEach(item => item.classList.remove('active'));
    filter.classList.add('active');
    const category = filter.dataset.filter;
    document.querySelectorAll('[data-category]').forEach(item => {
      item.hidden = category !== 'all' && item.dataset.category !== category;
    });
  }
});

document.querySelectorAll('[data-demo-form]').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const toast = document.querySelector('.demo-toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  });
});

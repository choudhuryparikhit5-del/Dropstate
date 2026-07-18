/* ============================================================================
   DROPSTATE THEME - Main JavaScript
   ============================================================================ */

// DOM Elements
const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileCloseBtn = document.getElementById('mobileCloseBtn');
const cartOpenBtn = document.getElementById('cartOpenBtn');
const cartCloseBtn = document.getElementById('cartCloseBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');

// Mobile Menu Toggle
if (burgerBtn && mobileMenu && mobileCloseBtn) {
  burgerBtn.addEventListener('click', () => {
    mobileMenu.classList.add('active');
  });

  mobileCloseBtn.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
  });

  // Close menu when clicking on links
  document.querySelectorAll('.mobile-menu-links a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
    });
  });
}

// Cart Drawer Toggle
if (cartOpenBtn && cartDrawer && cartCloseBtn) {
  cartOpenBtn.addEventListener('click', () => {
    cartDrawer.classList.add('active');
  });

  cartCloseBtn.addEventListener('click', () => {
    cartDrawer.classList.remove('active');
  });

  if (cartOverlay) {
    cartOverlay.addEventListener('click', () => {
      cartDrawer.classList.remove('active');
    });
  }
}

// Update Cart Display
async function updateCartDrawer() {
  try {
    const response = await fetch('/cart.js');
    const cart = await response.json();
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSubtotal = document.getElementById('cartSubtotal');

    if (!cartItemsContainer || !cartSubtotal) return;

    if (cart.items.length === 0) {
      cartItemsContainer.innerHTML = '<p class="cart-empty">Your bag is empty</p>';
      cartSubtotal.textContent = '₹0';
      return;
    }

    let html = '';
    cart.items.forEach(item => {
      html += `
        <div class="cart-item-row">
          <div class="cart-item-image">
            <img src="${item.image}" alt="${item.title}">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-variant">${item.variant_title}</div>
            <div class="cart-item-price">₹${(item.price / 100).toFixed(2)}</div>
            <div style="font-size: 12px; color: var(--gray); margin-top: 4px;">Qty: ${item.quantity}</div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</button>
          </div>
        </div>
      `;
    });

    cartItemsContainer.innerHTML = html;
    cartSubtotal.textContent = '₹' + (cart.total_price / 100).toFixed(2);
  } catch (error) {
    console.error('Error updating cart:', error);
  }
}

// Remove Item from Cart
function removeFromCart(itemId) {
  fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: itemId, quantity: 0 })
  }).then(() => updateCartDrawer());
}

// Add to Cart Handler
function addToCart(formElement) {
  const formData = new FormData(formElement);
  
  fetch('/cart/add.js', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    updateCartDrawer();
    if (cartDrawer) {
      cartDrawer.classList.add('active');
    }
    showNotification('Item added to bag!');
  })
  .catch(error => {
    console.error('Error adding to cart:', error);
    showNotification('Error adding item to bag', 'error');
  });
}

// Show Notification
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <p>${message}</p>
    <button onclick="this.parentElement.remove()" class="notification-close">×</button>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Lazy Load Images
function lazyLoadImages() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// Smooth Scroll to Anchor
function smoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Format Currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount / 100);
}

// Debounce Function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Product Variant Selection
function handleVariantSelection() {
  const variantSelects = document.querySelectorAll('[data-variant-select]');
  
  variantSelects.forEach(select => {
    select.addEventListener('change', function() {
      const productForm = this.closest('form');
      const selectedVariant = this.value;
      
      // Update product image if needed
      const variantImage = document.querySelector(`[data-variant-image="${selectedVariant}"]`);
      if (variantImage) {
        const mainImage = document.querySelector('.product-image-main');
        if (mainImage) {
          mainImage.src = variantImage.dataset.src;
        }
      }
      
      // Update price
      const priceElement = document.querySelector('[data-variant-price]');
      if (priceElement) {
        priceElement.textContent = formatCurrency(parseInt(this.options[this.selectedIndex].dataset.price));
      }
    });
  });
}

// Animation on Scroll
function animateOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
  });
}

// Search Functionality
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  const debouncedSearch = debounce(function() {
    const query = searchInput.value.trim();
    if (query.length < 2) {
      document.getElementById('suggestionsDropdown').innerHTML = '';
      return;
    }

    // Fetch search suggestions
    fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product`)
      .then(response => response.json())
      .then(data => {
        const suggestionsDropdown = document.getElementById('suggestionsDropdown');
        suggestionsDropdown.innerHTML = '';

        if (data.resources.results.products && data.resources.results.products.length > 0) {
          data.resources.results.products.forEach(product => {
            const suggestion = document.createElement('a');
            suggestion.href = product.url;
            suggestion.className = 'suggestion-item';
            suggestion.innerHTML = `
              <img src="${product.image.url}" alt="${product.title}">
              <span>${product.title}</span>
            `;
            suggestionsDropdown.appendChild(suggestion);
          });
        }
      })
      .catch(error => console.error('Search error:', error));
  }, 300);

  searchInput.addEventListener('input', debouncedSearch);

  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-box')) {
      document.getElementById('suggestionsDropdown').innerHTML = '';
    }
  });
}

// Accessibility: Keyboard Navigation
function setupKeyboardNav() {
  document.addEventListener('keydown', function(e) {
    // Close mobile menu with Escape
    if (e.key === 'Escape') {
      if (mobileMenu && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
      }
      if (cartDrawer && cartDrawer.classList.contains('active')) {
        cartDrawer.classList.remove('active');
      }
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  lazyLoadImages();
  smoothScroll();
  handleVariantSelection();
  animateOnScroll();
  setupSearch();
  setupKeyboardNav();
  updateCartDrawer();

  // Update cart when items are added
  document.addEventListener('cart:updated', updateCartDrawer);

  // Listen for cart changes via mutation observer
  const cartForm = document.querySelector('[action="/cart/add"]');
  if (cartForm) {
    cartForm.addEventListener('submit', function(e) {
      e.preventDefault();
      addToCart(this);
    });
  }
});

// Handle window resize for responsive behavior
window.addEventListener('resize', debounce(function() {
  // Close mobile menu on resize to desktop
  if (window.innerWidth > 980 && mobileMenu) {
    mobileMenu.classList.remove('active');
  }
}, 250));

// Export functions for use in other scripts
window.dropstate = {
  addToCart,
  removeFromCart,
  updateCartDrawer,
  showNotification,
  formatCurrency,
  debounce
};

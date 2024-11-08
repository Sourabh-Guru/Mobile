// Cart functionality

const API_URL = 'http://localhost:3000/api';
let cart = [];


function addToCart(productId) {
    const product = getProductById(productId);
    cart.push(product);
    updateCartCount();
    saveCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    saveCart();
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

// Product detail page functionality
function initializeProductDetail() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            // Add active class to clicked thumbnail
            this.classList.add('active');
            // Update main image
            const mainImage = document.querySelector('.main-image img');
            const thumbImage = this.querySelector('img');
            mainImage.src = thumbImage.src.replace('thumb', 'large');
        });
    });
}

// Checkout functionality
function processCheckout(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const orderData = {
        items: cart,
        customer: {
            name: formData.get('name'),
            email: formData.get('email'),
            address: formData.get('address')
        },
        total: calculateTotal()
    };
    
    // Save order
    saveOrder(orderData);
    // Clear cart
    cart = [];
    saveCart();
    // Redirect to order confirmation
    window.location.href = 'order-confirmation.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    if (document.querySelector('.product-detail')) {
        initializeProductDetail();
    }
});

// JavaScript to add "active" class to the current navigation link
document.querySelectorAll('.nav-links a').forEach(link => {
    if (window.location.pathname === new URL(link.href).pathname) {
        link.classList.add('active');
    }
});

//Cart items 

const items = {
    'item1': {
        price: 49900,
        originalPrice: 79000,
        quantity: 1
    }
};

function formatPrice(price) {
    return '₹' + price.toLocaleString('en-IN');
}

function updateQuantity(itemId, change) {
    const item = items[itemId];
    const newQuantity = item.quantity + change;
    
    if (newQuantity < 1) return;
    
    item.quantity = newQuantity;
    document.getElementById(`quantity-${itemId}`).textContent = newQuantity;
    updateTotals();
}

function removeItem(itemId) {
    const element = document.getElementById(itemId);
    element.remove();
    delete items[itemId];
    updateTotals();
    
    const itemCount = Object.keys(items).length;
    document.getElementById('itemCount').textContent = itemCount;
    
    if (itemCount === 0) {
        document.querySelector('.cart-items').innerHTML = '<div class="card cart-item"><p style="text-align: center; padding: 20px;">Your cart is empty</p></div>';
    }
}

function updateTotals() {
    const subtotal = Object.values(items).reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    
    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('total').textContent = formatPrice(subtotal);
}

function placeOrder() {
    if (Object.keys(items).length === 0) {
        alert('Your cart is empty!');
        return;
    }
}

// Function to set a session value
function setSessionValue(key, value) {
    sessionStorage.setItem(key, value);
    updateDisplay();
}

// Function to retrieve and display session data
function updateDisplay() {
    let storedValue = sessionStorage.getItem('myKey') || 'No value set';
    document.getElementById('session-value').textContent = `Session Value: ${storedValue}`;
}

// Function to clear the session data
function clearSession() {
    sessionStorage.removeItem('myKey');
    updateDisplay();
}

// Initialize the display when the page loads
window.onload = updateDisplay;


// Retrieve data from sessionStorage
document.getElementById("subtotalDisplay").textContent = sessionStorage.getItem("subtotal");
document.getElementById("deliveryDisplay").textContent = sessionStorage.getItem("delivery");
document.getElementById("totalDisplay").textContent = sessionStorage.getItem("total");

// Optionally, check if data exists to avoid empty display
if (!sessionStorage.getItem("subtotal") || !sessionStorage.getItem("total")) {
    document.body.innerHTML = "<p>No order summary available.</p>";
}



// product  page  

function saveToSession() {
    // Retrieve values from HTML elements
    const subtotal = document.getElementById("subtotal").textContent;
    const delivery = document.querySelector(".free-delivery").textContent;
    const total = document.getElementById("total").textContent;

    // Store in sessionStorage
    sessionStorage.setItem("subtotal", subtotal);
    sessionStorage.setItem("delivery", delivery);
    sessionStorage.setItem("total", total);

    // alert("Order summary saved to session!");
  }

  // Cart File 

  function saveToSession() {
    // Retrieve values from HTML elements
    const subtotal = document.getElementById("subtotal").textContent;
    const delivery = document.querySelector(".free-delivery").textContent;
    const total = document.getElementById("total").textContent;

    // Store in sessionStorage
    sessionStorage.setItem("subtotal", subtotal);
    sessionStorage.setItem("delivery", delivery);
    sessionStorage.setItem("total", total);

    // alert("Order summary saved to session!");
  }
  
  function passvalues(){
    var name=document.getElementById("txt").value;
    localStorage.setItem("textvalues", name);
    return false;
  }

  // order From

// Retrieve data from sessionStorage
document.getElementById("subtotalDisplay").textContent = sessionStorage.getItem("subtotal");
document.getElementById("deliveryDisplay").textContent = sessionStorage.getItem("delivery");
document.getElementById("totalDisplay").textContent = sessionStorage.getItem("total");
                  
 // Optionally, check if data exists to avoid empty display
                          if (!sessionStorage.getItem("subtotal") || !sessionStorage.getItem("total")) {
     document.body.innerHTML = "<p>No order summary available.</p>";
}

// order form 
  // Set initial login info
  document.getElementById('loginInfo').innerHTML = `
  <div style="color: #666;">
      Sourabh gurav Gurav +919113286721
  </div>
`;

function handleSubmit(event) {
  event.preventDefault();
  
  // Basic form validation
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const city = document.getElementById('city').value;
  const pincode = document.getElementById('pincode').value;

  if (!name || !phone || !address || !city || !pincode) {
      alert('Please fill in all required fields');
      return;
  }

  // Phone number validation
  if (!/^\d{10}$/.test(phone)) {
      alert('Please enter a valid 10-digit phone number');
      return;
  }

  // Pincode validation
  if (!/^\d{6}$/.test(pincode)) {
      alert('Please enter a valid 6-digit pincode');
      return;
  }

  // Show success modal
  showModal();
}

function showModal() {
  document.getElementById('successModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('successModal').style.display = 'none';
  // Redirect to home page or shopping page
  // window.location.href = 'index.html';
}

// Optional: Add smooth transitions for modal
document.getElementById('successModal').addEventListener('click', function(event) {
  if (event.target === this) {
      closeModal();
  }
});

// order page 
                  // Retrieve data from sessionStorage

                  document.getElementById("totalDisplay").textContent = sessionStorage.getItem("total");
          
                  // Optionally, check if data exists to avoid empty display
                  if (!sessionStorage.getItem("subtotal") || !sessionStorage.getItem("total")) {

                      document.body.innerHTML = "<p>No order summary available.</p>";
                  }


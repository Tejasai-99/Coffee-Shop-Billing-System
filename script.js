// static/js/script.js

// This ensures our JavaScript code runs only after the entire webpage is loaded
document.addEventListener('DOMContentLoaded', function() {
    // ----------------------------------------
    // 1. Get references to HTML elements we'll interact with
    // ----------------------------------------
    const cart = {}; // This JavaScript object will store our order: {item_id: {name, price, quantity}}
    const cartElement = document.getElementById('cart');
    const subtotalElement = document.getElementById('subtotal');
    const gstElement = document.getElementById('gst');
    const totalAmountElement = document.getElementById('total_amount');
    const checkoutForm = document.getElementById('checkout-form');
    const billOutput = document.getElementById('bill-output');
    const billContent = document.getElementById('bill-content');
    const changeElement = document.getElementById('change');
    const newOrderButton = document.getElementById('new-order-btn');

    // ----------------------------------------
    // 2. Function to update the cart display and calculations
    //    This runs whenever items are added/removed/quantity changed
    // ----------------------------------------
    function updateCartDisplay() {
        let subtotal = 0;
        let cartHtml = '<ul>'; // Start building the HTML list for the cart

        if (Object.keys(cart).length === 0) {
            cartHtml = '<p>Your cart is empty.</p>'; // If cart is empty, show this message
        } else {
            // Loop through each item in our 'cart' object
            for (const itemId in cart) {
                const item = cart[itemId];
                subtotal += item.price * item.quantity; // Add to subtotal

                // Build HTML for each item in the cart
                cartHtml += `
                    <li>
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-quantity-controls">
                            <button data-id="${itemId}" data-action="decrease">-</button>
                            <span>${item.quantity}</span>
                            <button data-id="${itemId}" data-action="increase">+</button>
                        </span>
                        <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                        <button class="remove-from-cart" data-id="${itemId}">x</button>
                    </li>
                `;
            }
            cartHtml += '</ul>'; // Close the HTML list
        }

        cartElement.innerHTML = cartHtml; // Update the 'cart' div in HTML

        const gst = subtotal * 0.05; // Calculate 5% GST
        const totalAmount = subtotal + gst; // Calculate total

        // Update the numbers displayed on the page
        subtotalElement.textContent = subtotal.toFixed(2);
        gstElement.textContent = gst.toFixed(2);
        totalAmountElement.textContent = totalAmount.toFixed(2);

        // ----------------------------------------
        // Attach event listeners to the new buttons in the cart
        // (These buttons are created dynamically, so we attach listeners here)
        // ----------------------------------------
        document.querySelectorAll('#cart button[data-action="decrease"]').forEach(button => {
            button.onclick = (e) => adjustQuantity(e.target.dataset.id, -1);
        });
        document.querySelectorAll('#cart button[data-action="increase"]').forEach(button => {
            button.onclick = (e) => adjustQuantity(e.target.dataset.id, 1);
        });
        document.querySelectorAll('#cart .remove-from-cart').forEach(button => {
            button.onclick = (e) => removeItem(e.target.dataset.id);
        });
    }

    // ----------------------------------------
    // 3. Functions for adjusting cart items
    // ----------------------------------------
    function adjustQuantity(itemId, change) {
        if (cart[itemId]) {
            cart[itemId].quantity += change;
            if (cart[itemId].quantity <= 0) {
                delete cart[itemId]; // Remove item if quantity drops to 0 or less
            }
            updateCartDisplay(); // Update the display after change
        }
    }

    function removeItem(itemId) {
        delete cart[itemId]; // Remove item completely from cart
        updateCartDisplay(); // Update the display
    }

    // ----------------------------------------
    // 4. Event Listener for "Add to Cart" Buttons on Menu
    // ----------------------------------------
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            // Get item info from the button's data attributes
            const itemId = this.dataset.id;
            const itemName = this.dataset.name;
            const itemPrice = parseFloat(this.dataset.price); // Convert string price to number

            if (cart[itemId]) {
                cart[itemId].quantity += 1; // If item already in cart, just increase quantity
            } else {
                // If new item, add it to the cart object
                cart[itemId] = {
                    name: itemName,
                    price: itemPrice,
                    quantity: 1
                };
            }
            updateCartDisplay(); // Update what the user sees
        });
    });

    // ----------------------------------------
    // 5. Event Listener for "Generate Bill" Form Submission
    // ----------------------------------------
    checkoutForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Stop the form from doing its default page reload

        // Get customer and payment details from the form
        const customerName = document.getElementById('customer_name').value.trim();
        const customerPhone = document.getElementById('customer_phone').value.trim();
        const amountPaid = parseFloat(document.getElementById('amount_paid').value);
        const totalAmount = parseFloat(totalAmountElement.textContent); // Get calculated total from display

        // Basic frontend validation
        if (Object.keys(cart).length === 0) {
            alert("Your cart is empty! Please add items before generating a bill.");
            return;
        }
        if (amountPaid < totalAmount) {
            alert("Amount paid is less than the total amount!");
            return;
        }
        if (customerName === "") {
            alert("Please enter customer name.");
            return;
        }
        if (!/^\d{10}$/.test(customerPhone)) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }


        // Prepare the data to send to Flask (our backend)
        const orderDetails = {
            customer_name: customerName,
            customer_phone: customerPhone,
            items: Object.values(cart), // Convert cart object to an array of items
            amount_paid: amountPaid
        };

        try {
            // Send the order data to Flask using the 'fetch' API
            const response = await fetch('/checkout', {
                method: 'POST', // We are sending data
                headers: {
                    'Content-Type': 'application/json' // Tell Flask we're sending JSON
                },
                body: JSON.stringify(orderDetails) // Convert JavaScript object to JSON string
            });

            // Check if the response from Flask was successful (status code 200)
            if (!response.ok) {
                const errorData = await response.json(); // Get error message from Flask
                throw new Error(errorData.error || 'Something went wrong during checkout.');
            }

            // Get the JSON data (bill details) sent back from Flask
            const data = await response.json();

            // Display the bill in the 'bill-output' section
            billOutput.style.display = 'block'; // Make the bill section visible
            billContent.textContent = data.bill_content; // Insert the formatted bill text
            changeElement.textContent = data.change.toFixed(2); // Display the change

            // Optional: Clear the cart and form for a new order
            for (const key in cart) { // Loop and remove all items from cart object
                delete cart[key];
            }
            updateCartDisplay(); // Clear the cart display on the page
            checkoutForm.reset(); // Clear form input fields
            checkoutForm.style.display = 'none'; // Hide checkout form
        } catch (error) {
            console.error('Error during checkout:', error);
            alert('Checkout failed: ' + error.message);
        }
    });

    // ----------------------------------------
    // 6. Event Listener for "New Order" Button
    // ----------------------------------------
    newOrderButton.addEventListener('click', function() {
        billOutput.style.display = 'none'; // Hide the bill
        checkoutForm.style.display = 'block'; // Show the checkout form again
        // Cart and form are already reset from previous checkout success
    });

    // Initial call to display an empty cart when the page first loads
    updateCartDisplay();
});
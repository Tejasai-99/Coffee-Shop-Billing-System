# app.py

from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Configure the SQLite database
# It will create a file named 'site.db' in your project folder
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # Good practice to disable

db = SQLAlchemy(app)

# Define the MenuItem database model (our coffee items)
class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    price = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return f"MenuItem('{self.name}', {self.price})"

# --- Web Page Routes ---

# Home page: Displays the menu
@app.route('/')
def index():
    menu_items = MenuItem.query.all() # Get all items from the database
    return render_template('index.html', menu_items=menu_items)

# API endpoint for handling checkout (receives order from JavaScript)
@app.route('/checkout', methods=['POST'])
def checkout():
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400

    order_data = request.get_json()

    customer_name = order_data.get('customer_name')
    customer_phone = order_data.get('customer_phone')
    items_ordered = order_data.get('items', [])
    amount_paid = order_data.get('amount_paid')

    # Basic validation
    if not all([customer_name, customer_phone, items_ordered, amount_paid is not None]):
        return jsonify({'error': 'Missing required order data'}), 400
    if not isinstance(amount_paid, (int, float)) or amount_paid < 0:
        return jsonify({'error': 'Invalid amount paid'}), 400
    if not customer_phone.isdigit() or len(customer_phone) != 10:
        return jsonify({'error': 'Phone number must be 10 digits'}), 400

    total_sum = 0
    bill_lines = []
    bill_lines.append("="*30)
    bill_lines.append("      COFFEE SHOP BILL      ")
    bill_lines.append("="*30)
    bill_lines.append(f"Name: {customer_name}")
    bill_lines.append(f"Phone: {customer_phone}")
    bill_lines.append("-" * 30)
    bill_lines.append("Item              Qty   Price Total")
    bill_lines.append("-" * 30)

    for item_data in items_ordered:
        item_name = item_data.get('name', 'Unknown')
        item_price = item_data.get('price', 0.0)
        item_quantity = item_data.get('quantity', 0)

        # Basic item validation
        if not all([isinstance(item_name, str), isinstance(item_price, (int, float)), isinstance(item_quantity, int)]):
            return jsonify({'error': f'Invalid item data: {item_data}'}), 400
        if item_quantity <= 0:
            continue # Skip items with zero or negative quantity

        line_total = item_price * item_quantity
        total_sum += line_total
        # Format for bill: "ItemName         xQty   Rs.Price Rs.Total"
        bill_lines.append(f"{item_name:<16}x{item_quantity:<4}{item_price:>7.2f} {line_total:>7.2f}")


    gst = total_sum * 0.05
    total_amount = total_sum + gst
    change = amount_paid - total_amount

    bill_lines.append("-" * 30)
    bill_lines.append(f"Subtotal: {'':<18}₹{total_sum:>7.2f}")
    bill_lines.append(f"GST (5%): {'':<18}₹{gst:>7.2f}")
    bill_lines.append(f"TOTAL: {'':<21}₹{total_amount:>7.2f}")
    bill_lines.append("-" * 30)
    bill_lines.append(f"Amount Paid: {'':<15}₹{amount_paid:>7.2f}")
    bill_lines.append(f"Change Due: {'':<16}₹{change:>7.2f}")
    bill_lines.append("="*30)
    bill_lines.append("    THANK YOU FOR YOUR VISIT!   ")
    bill_lines.append("="*30)

    full_bill_content = "\n".join(bill_lines)

    # Return the bill details as JSON to the frontend
    return jsonify({
        'total_amount': total_amount,
        'gst': gst,
        'change': change,
        'bill_content': full_bill_content
    }), 200 # 200 means success!

# This block runs when you execute app.py directly
if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Creates the database tables based on our MenuItem class

        # Add default menu items ONLY if the database is empty
        if not MenuItem.query.first():
            default_items = [
                MenuItem(name="Americano", price=85.0),
                MenuItem(name="Caramel", price=90.0),
                MenuItem(name="Cappuccino", price=100.0),
                MenuItem(name="Coffee Jelly", price=90.0),
                MenuItem(name="Latte", price=90.0),
                MenuItem(name="Strawberry Cream", price=80.0),
                MenuItem(name="Mochaccino", price=50.0),
                MenuItem(name="Vanilla Bean", price=40.0),
                MenuItem(name="Long Black", price=60.0),
                MenuItem(name="Milkshake", price=80.0),
                MenuItem(name="Flat White", price=50.0),
                MenuItem(name="Milk Tea", price=20.0)
            ]
            db.session.add_all(default_items) # Add all items to the session
            db.session.commit() # Save them to the database
            print("Default menu items added to the database (site.db).")
    app.run(debug=True) # Run the Flask app. debug=True restarts on code changes.
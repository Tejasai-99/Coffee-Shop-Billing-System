# Coffee Shop Billing System

## Project Overview

This is a web-based Point-of-Sale (POS) system developed for a coffee shop to efficiently manage menu items, process customer orders, and generate detailed bills. Built with Python Flask for the backend and standard web technologies for the frontend, it provides a practical solution for streamlining daily operations in a cafe environment.

## Features

* **Dynamic Menu Display:** Fetches and presents a customizable coffee menu directly from an SQLite database.
* **Interactive Order Management:** Allows users to intuitively add items to a virtual cart, adjust quantities, and remove selections in real-time.
* **Automated Billing:** Automatically calculates subtotal, Goods and Services Tax (GST), and the final total amount.
* **Customer Transaction Processing:** Facilitates the input of customer details and amount paid, then generates a formatted receipt including change due.
* **Persistent Data Storage:** Utilizes SQLite for reliable storage of menu items, ensuring data availability across sessions.

## Technologies Used

* **Backend:** Python 3 (Flask, Flask-SQLAlchemy)
* **Database:** SQLite
* **Frontend:** HTML5, CSS3, JavaScript
* **Styling:** Custom CSS
* **Package Management:** `pip`
* **Version Control:** Git, GitHub

## 🚀 How to Run Locally

Follow these steps to get the Coffee Shop Billing System up and running on your local machine:

1.  **Clone the Repository (if you used Git initially) OR Download the project files:**
    If you're viewing this on GitHub, you can click the "Code" button and select "Download ZIP" to get all the files. Then unzip it.

2.  **Navigate to the Project Directory:**
    Open your terminal or Command Prompt and go to the `easy_coffee_app` folder:
    ```bash
    cd path/to/your/easy_coffee_app
    ```

3.  **Create and Activate a Virtual Environment:**
    It's best practice to isolate project dependencies.
    ```bash
    python -m venv venv
    ```
    * **On Windows:**
        ```bash
        .\venv\Scripts\activate
        ```
    * **On macOS/Linux:**
        ```bash
        source venv/bin/activate
        ```
    (You should see `(venv)` at the start of your terminal prompt, indicating the environment is active.)

4.  **Install Required Python Packages:**
    With the virtual environment active, install Flask and Flask-SQLAlchemy:
    ```bash
    pip install Flask Flask-SQLAlchemy
    ```

5.  **Run the Flask Application:**
    ```bash
    python app.py
    ```
    The terminal will show output like `* Running on http://127.0.0.1:5000`. This means your server is live!

6.  **Access the Application:**
    Open your web browser and go to:
    ```
    [http://127.0.0.1:5000/](http://127.0.0.1:5000/)
    ```
    You should see the Coffee Shop Menu page.

7.  **Stop the Server:**
    In the terminal where your Flask app is running, press `CTRL + C`.

## 🛠️ Project Structure


easy_coffee_app/
├── venv/                   # Python Virtual Environment (DO NOT upload to GitHub)
├── app.py                  # Flask backend application logic and database setup
├── site.db                 # SQLite database file (created automatically by app.py)
├── templates/
│   └── index.html          # Main HTML template for the web interface
└── static/
├── css/
│   └── style.css       # Custom CSS for styling the application
└── js/
└── script.js       # JavaScript for frontend interactivity (cart logic, bill generation)




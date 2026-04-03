const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// In-memory db
const state = {
    orders: [],
    reservations: [],
    settings: {
        deliveryFee: 40,
        bannerText: "Welcome to Masala Box! Order online for 10% off."
    },
    menu: [
      {
        "id": 1,
        "name": "Veg Manchurian with gravy",
        "category": "Mains",
        "price": 275,
        "desc": "Chinese Veg Mains"
      },
      {
        "id": 2,
        "name": "Stir Fried Vegetables in Hot Garlic Sauce",
        "category": "Mains",
        "price": 275,
        "desc": "Chinese Veg Mains"
      },
      {
        "id": 3,
        "name": "Vegetable Chopsuey",
        "category": "Mains",
        "price": 275,
        "desc": "Chinese Veg Mains"
      },
      {
        "id": 4,
        "name": "Cheese Chilli with Gravy",
        "category": "Mains",
        "price": 290,
        "desc": "Chinese Veg Mains"
      },
      {
        "id": 5,
        "name": "Chilli Chicken with Gravy",
        "category": "Mains",
        "price": 380,
        "desc": "Chinese Non-Veg Mains"
      },
      {
        "id": 6,
        "name": "Garlic Chicken with Gravy",
        "category": "Mains",
        "price": 380,
        "desc": "Chinese Non-Veg Mains"
      },
      {
        "id": 7,
        "name": "Lemon Chicken with Gravy",
        "category": "Mains",
        "price": 380,
        "desc": "Chinese Non-Veg Mains"
      },
      {
        "id": 8,
        "name": "Chicken Chopsuey",
        "category": "Mains",
        "price": 380,
        "desc": "Chinese Non-Veg Mains"
      },
      {
        "id": 9,
        "name": "Chilly Chicken Boneless Gravy",
        "category": "Mains",
        "price": 390,
        "desc": "Chinese Non-Veg Mains"
      },
      {
        "id": 10,
        "name": "Yellow Daal Tadka",
        "category": "Mains",
        "price": 215,
        "desc": "Veg Delicacies"
      },
      {
        "id": 11,
        "name": "Daal Makhani",
        "category": "Mains",
        "price": 225,
        "desc": "Veg Delicacies"
      },
      {
        "id": 12,
        "name": "Daal Amritsari",
        "category": "Mains",
        "price": 225,
        "desc": "Veg Delicacies"
      },
      {
        "id": 13,
        "name": "Vegetable Jalfrezi",
        "category": "Mains",
        "price": 255,
        "desc": "Veg Delicacies"
      },
      {
        "id": 14,
        "name": "Sabz Lakhnavi",
        "category": "Mains",
        "price": 275,
        "desc": "Veg Delicacies"
      },
      {
        "id": 15,
        "name": "Cream of Boiled Vegetables",
        "category": "Mains",
        "price": 285,
        "desc": "Veg Delicacies"
      },
      {
        "id": 16,
        "name": "Navratna Korma",
        "category": "Mains",
        "price": 285,
        "desc": "Veg Delicacies"
      },
      {
        "id": 17,
        "name": "Palak Corn",
        "category": "Mains",
        "price": 285,
        "desc": "Veg Delicacies"
      },
      {
        "id": 18,
        "name": "Mushroom Masala",
        "category": "Mains",
        "price": 285,
        "desc": "Veg Delicacies"
      },
      {
        "id": 19,
        "name": "Mushroom Do Pyaza",
        "category": "Mains",
        "price": 285,
        "desc": "Veg Delicacies"
      },
      {
        "id": 20,
        "name": "Mushroom Matar Methi Malai",
        "category": "Mains",
        "price": 295,
        "desc": "Veg Delicacies"
      },
      {
        "id": 21,
        "name": "Chana Masala",
        "category": "Mains",
        "price": 285,
        "desc": "Veg Delicacies"
      },
      {
        "id": 22,
        "name": "Malai Kofta",
        "category": "Mains",
        "price": 295,
        "desc": "Veg Delicacies"
      },
      {
        "id": 23,
        "name": "Kadhai Paneer",
        "category": "Mains",
        "price": 295,
        "desc": "Veg Delicacies"
      },
      {
        "id": 24,
        "name": "Paneer Lababdaar",
        "category": "Mains",
        "price": 295,
        "desc": "Veg Delicacies"
      },
      {
        "id": 25,
        "name": "Paneer Makhani",
        "category": "Mains",
        "price": 295,
        "desc": "Veg Delicacies"
      },
      {
        "id": 26,
        "name": "Paneer Khurchan",
        "category": "Mains",
        "price": 295,
        "desc": "Veg Delicacies"
      },
      {
        "id": 27,
        "name": "Paneer Do Pyaza",
        "category": "Mains",
        "price": 295,
        "desc": "Veg Delicacies"
      },
      {
        "id": 28,
        "name": "Paneer Methi Bahaar",
        "category": "Mains",
        "price": 305,
        "desc": "Veg Delicacies"
      },
      {
        "id": 29,
        "name": "Paneer Tikka Butter Masala",
        "category": "Mains",
        "price": 305,
        "desc": "Veg Delicacies"
      },
      {
        "id": 30,
        "name": "Palak Paneer",
        "category": "Mains",
        "price": 295,
        "desc": "Veg Delicacies"
      },
      {
        "id": 31,
        "name": "Paneer Bhurji",
        "category": "Mains",
        "price": 295,
        "desc": "Veg Delicacies"
      },
      {
        "id": 32,
        "name": "Vegetable Seekh Kabab",
        "category": "Starters",
        "price": 255,
        "desc": "Tandoori Veg Starters"
      },
      {
        "id": 33,
        "name": "Soya Chaap Tikka",
        "category": "Starters",
        "price": 265,
        "desc": "Tandoori Veg Starters"
      },
      {
        "id": 34,
        "name": "Soya Chaap Malai Tikka",
        "category": "Starters",
        "price": 275,
        "desc": "Tandoori Veg Starters"
      },
      {
        "id": 35,
        "name": "Tandoori Bharwan Aloo",
        "category": "Starters",
        "price": 285,
        "desc": "Tandoori Veg Starters"
      },
      {
        "id": 36,
        "name": "Paneer Tikka",
        "category": "Starters",
        "price": 285,
        "desc": "Tandoori Veg Starters"
      },
      {
        "id": 37,
        "name": "Paneer Tikka Badshahi",
        "category": "Starters",
        "price": 285,
        "desc": "Tandoori Veg Starters"
      },
      {
        "id": 38,
        "name": "Paneer Tikka Achaari",
        "category": "Starters",
        "price": 285,
        "desc": "Tandoori Veg Starters"
      },
      {
        "id": 39,
        "name": "Paneer Malai Tikka",
        "category": "Starters",
        "price": 295,
        "desc": "Tandoori Veg Starters"
      },
      {
        "id": 40,
        "name": "Paneer Mirch Malai Tikka",
        "category": "Starters",
        "price": 305,
        "desc": "Tandoori Veg Starters"
      },
      {
        "id": 41,
        "name": "Mushroom Tikka",
        "category": "Starters",
        "price": 285,
        "desc": "Tandoori Veg Starters"
      },
      {
        "id": 42,
        "name": "Stuffed Mushroom Mughlai Tikka",
        "category": "Starters",
        "price": 295,
        "desc": "Tandoori Veg Starters"
      },
      {
        "id": 43,
        "name": "Tandoori Veg Platter",
        "category": "Starters",
        "price": 495,
        "desc": "Tandoori Veg Starters"
      },
      {
        "id": 44,
        "name": "Makki Malai Seekh",
        "category": "Starters",
        "price": 295,
        "desc": "Tandoori Veg Starters"
      },
      {
        "id": 45,
        "name": "Tandoori Chicken",
        "category": "Starters",
        "price": 315,
        "desc": "Tandoori Non-Veg Starters"
      },
      {
        "id": 46,
        "name": "Tandoori Lemon Chicken",
        "category": "Starters",
        "price": 345,
        "desc": "Tandoori Non-Veg Starters"
      },
      {
        "id": 47,
        "name": "Chicken Pudina Tikka",
        "category": "Starters",
        "price": 345,
        "desc": "Tandoori Non-Veg Starters"
      },
      {
        "id": 48,
        "name": "Chicken Tikka",
        "category": "Starters",
        "price": 345,
        "desc": "Tandoori Non-Veg Starters"
      },
      {
        "id": 49,
        "name": "Chicken Seekh Kebab",
        "category": "Starters",
        "price": 345,
        "desc": "Tandoori Non-Veg Starters"
      },
      {
        "id": 50,
        "name": "Arabian Spice Chicken",
        "category": "Starters",
        "price": 355,
        "desc": "Tandoori Non-Veg Starters"
      },
      {
        "id": 51,
        "name": "Afghani Chicken",
        "category": "Starters",
        "price": 365,
        "desc": "Tandoori Non-Veg Starters"
      },
      {
        "id": 52,
        "name": "Chicken Malai Tikka",
        "category": "Starters",
        "price": 355,
        "desc": "Tandoori Non-Veg Starters"
      },
      {
        "id": 53,
        "name": "Chicken Mirch Malai Tikka",
        "category": "Starters",
        "price": 375,
        "desc": "Tandoori Non-Veg Starters"
      },
      {
        "id": 54,
        "name": "Fish Tikka",
        "category": "Starters",
        "price": 450,
        "desc": "Tandoori Non-Veg Starters"
      },
      {
        "id": 55,
        "name": "Fish Ajwaini Tikka",
        "category": "Starters",
        "price": 450,
        "desc": "Tandoori Non-Veg Starters"
      },
      {
        "id": 56,
        "name": "Fish Malai Tikka",
        "category": "Starters",
        "price": 450,
        "desc": "Tandoori Non-Veg Starters"
      },
      {
        "id": 57,
        "name": "Fish Pudina Tikka",
        "category": "Starters",
        "price": 450,
        "desc": "Tandoori Non-Veg Starters"
      },
      {
        "id": 58,
        "name": "Tandoori Non-Veg Platter",
        "category": "Starters",
        "price": 650,
        "desc": "Tandoori Non-Veg Starters"
      },
      {
        "id": 59,
        "name": "Butter Chicken",
        "category": "Mains",
        "price": 380,
        "desc": "Non-Veg Delicacies"
      },
      {
        "id": 60,
        "name": "Kadhai Chicken",
        "category": "Mains",
        "price": 380,
        "desc": "Non-Veg Delicacies"
      },
      {
        "id": 61,
        "name": "Dhaba Style Chicken Curry",
        "category": "Mains",
        "price": 380,
        "desc": "Non-Veg Delicacies"
      },
      {
        "id": 62,
        "name": "Chicken Methi Bahaar",
        "category": "Mains",
        "price": 380,
        "desc": "Non-Veg Delicacies"
      },
      {
        "id": 63,
        "name": "Chicken Tikka Butter Masala",
        "category": "Mains",
        "price": 390,
        "desc": "Non-Veg Delicacies"
      },
      {
        "id": 64,
        "name": "Rarha Chicken",
        "category": "Mains",
        "price": 390,
        "desc": "Non-Veg Delicacies"
      },
      {
        "id": 65,
        "name": "Chicken Khurchan",
        "category": "Mains",
        "price": 390,
        "desc": "Non-Veg Delicacies"
      },
      {
        "id": 66,
        "name": "Fish Curry",
        "category": "Mains",
        "price": 450,
        "desc": "Non-Veg Delicacies"
      },
      {
        "id": 67,
        "name": "Butter Chicken Boneless",
        "category": "Mains",
        "price": 390,
        "desc": "Non-Veg Delicacies"
      },
      {
        "id": 68,
        "name": "Standard Veg Thali",
        "category": "Mains",
        "price": 200,
        "desc": "Includes Daal Makhni, Mixed Veg, Butter Naan, Roti, Rice, etc."
      },
      {
        "id": 69,
        "name": "Deluxe Veg Thali",
        "category": "Mains",
        "price": 250,
        "desc": "Includes Paneer Delicacy, Daal Makhni, Mixed Veg, Breads, etc."
      },
      {
        "id": 70,
        "name": "Amritsari Kulche Choley",
        "category": "Mains",
        "price": 80,
        "desc": "Indian Combos"
      },
      {
        "id": 71,
        "name": "Daal Makhni with Butter Naan",
        "category": "Mains",
        "price": 175,
        "desc": "Indian Combos"
      },
      {
        "id": 72,
        "name": "Cheese Naan with Gravy",
        "category": "Mains",
        "price": 185,
        "desc": "Indian Combos"
      },
      {
        "id": 73,
        "name": "Keema Naan with Gravy",
        "category": "Mains",
        "price": 245,
        "desc": "Indian Combos"
      },
      {
        "id": 74,
        "name": "Choice of Paneer with Butter Naan",
        "category": "Mains",
        "price": 265,
        "desc": "Indian Combos"
      },
      {
        "id": 75,
        "name": "Choice of Chicken with Butter Naan",
        "category": "Mains",
        "price": 285,
        "desc": "Indian Combos"
      },
      {
        "id": 76,
        "name": "Veg Manchurian Fried Rice Box",
        "category": "Mains",
        "price": 245,
        "desc": "Chinese Combos"
      },
      {
        "id": 77,
        "name": "Cheese Chilly Fried Rice Box",
        "category": "Mains",
        "price": 265,
        "desc": "Chinese Combos"
      },
      {
        "id": 78,
        "name": "Chilly Chicken Fried Rice Box",
        "category": "Mains",
        "price": 285,
        "desc": "Chinese Combos"
      },
      {
        "id": 79,
        "name": "Veg Manchurian Noodle Box",
        "category": "Mains",
        "price": 245,
        "desc": "Chinese Combos"
      },
      {
        "id": 80,
        "name": "Cheese Chilly Noodle Box",
        "category": "Mains",
        "price": 265,
        "desc": "Chinese Combos"
      },
      {
        "id": 81,
        "name": "Chilly Chicken Noodle Box",
        "category": "Mains",
        "price": 285,
        "desc": "Chinese Combos"
      },
      {
        "id": 82,
        "name": "Veg Hakka Noodles",
        "category": "Breads & Rice",
        "price": 215,
        "desc": "Rice & Noodles"
      },
      {
        "id": 83,
        "name": "Chicken Hakka Noodles",
        "category": "Breads & Rice",
        "price": 275,
        "desc": "Rice & Noodles"
      },
      {
        "id": 84,
        "name": "Veg Chilly Garlic Noodles",
        "category": "Breads & Rice",
        "price": 225,
        "desc": "Rice & Noodles"
      },
      {
        "id": 85,
        "name": "Chicken Chilly Garlic Noodles",
        "category": "Breads & Rice",
        "price": 285,
        "desc": "Rice & Noodles"
      },
      {
        "id": 86,
        "name": "Veg Schezwan Noodles",
        "category": "Breads & Rice",
        "price": 225,
        "desc": "Rice & Noodles"
      },
      {
        "id": 87,
        "name": "Chicken Schezwan Noodles",
        "category": "Breads & Rice",
        "price": 285,
        "desc": "Rice & Noodles"
      },
      {
        "id": 88,
        "name": "Veg Fried Rice",
        "category": "Breads & Rice",
        "price": 225,
        "desc": "Rice & Noodles"
      },
      {
        "id": 89,
        "name": "Chicken Fried Rice",
        "category": "Breads & Rice",
        "price": 285,
        "desc": "Rice & Noodles"
      },
      {
        "id": 90,
        "name": "Spring Rolls",
        "category": "Starters",
        "price": 250,
        "desc": "Chinese Veg Starters"
      },
      {
        "id": 91,
        "name": "Veg Manchurian",
        "category": "Starters",
        "price": 275,
        "desc": "Chinese Veg Starters"
      },
      {
        "id": 92,
        "name": "Crispy Veg Salt and Pepper",
        "category": "Starters",
        "price": 280,
        "desc": "Chinese Veg Starters"
      },
      {
        "id": 93,
        "name": "Hara Bhara Kebab",
        "category": "Starters",
        "price": 280,
        "desc": "Chinese Veg Starters"
      },
      {
        "id": 94,
        "name": "Corn Salt and Pepper",
        "category": "Starters",
        "price": 280,
        "desc": "Chinese Veg Starters"
      },
      {
        "id": 95,
        "name": "Crispy Fried Corn",
        "category": "Starters",
        "price": 280,
        "desc": "Chinese Veg Starters"
      },
      {
        "id": 96,
        "name": "Honey Chilli Potato",
        "category": "Starters",
        "price": 280,
        "desc": "Chinese Veg Starters"
      },
      {
        "id": 97,
        "name": "Honey Chilli Cauliflower",
        "category": "Starters",
        "price": 280,
        "desc": "Chinese Veg Starters"
      },
      {
        "id": 98,
        "name": "Dahi ke Kabab",
        "category": "Starters",
        "price": 290,
        "desc": "Chinese Veg Starters"
      },
      {
        "id": 99,
        "name": "Chilli Mushroom",
        "category": "Starters",
        "price": 290,
        "desc": "Chinese Veg Starters"
      },
      {
        "id": 100,
        "name": "Mushroom Duplex",
        "category": "Starters",
        "price": 290,
        "desc": "Chinese Veg Starters"
      },
      {
        "id": 101,
        "name": "Spinach Cheese Triangles",
        "category": "Starters",
        "price": 290,
        "desc": "Chinese Veg Starters"
      },
      {
        "id": 102,
        "name": "Cheese Corn Rolls",
        "category": "Starters",
        "price": 290,
        "desc": "Chinese Veg Starters"
      },
      {
        "id": 103,
        "name": "Cheese Chilli Dry",
        "category": "Starters",
        "price": 290,
        "desc": "Chinese Veg Starters"
      },
      {
        "id": 104,
        "name": "Chinese Veg Platter",
        "category": "Starters",
        "price": 495,
        "desc": "Chinese Veg Starters"
      },
      {
        "id": 105,
        "name": "Schezwan Chicken",
        "category": "Starters",
        "price": 380,
        "desc": "Chinese Non-Veg Starters"
      },
      {
        "id": 106,
        "name": "Chilli Chicken",
        "category": "Starters",
        "price": 380,
        "desc": "Chinese Non-Veg Starters"
      },
      {
        "id": 107,
        "name": "Garlic Chicken",
        "category": "Starters",
        "price": 380,
        "desc": "Chinese Non-Veg Starters"
      },
      {
        "id": 108,
        "name": "Lemon Chicken",
        "category": "Starters",
        "price": 380,
        "desc": "Chinese Non-Veg Starters"
      },
      {
        "id": 109,
        "name": "Honey Chilli Crispy Chicken",
        "category": "Starters",
        "price": 380,
        "desc": "Chinese Non-Veg Starters"
      },
      {
        "id": 110,
        "name": "Cream of Boiled Chicken & Veggies",
        "category": "Starters",
        "price": 390,
        "desc": "Chinese Non-Veg Starters"
      },
      {
        "id": 111,
        "name": "Chilly Chicken Boneless",
        "category": "Starters",
        "price": 390,
        "desc": "Chinese Non-Veg Starters"
      },
      {
        "id": 112,
        "name": "Fish Chilli",
        "category": "Starters",
        "price": 450,
        "desc": "Chinese Non-Veg Starters"
      },
      {
        "id": 113,
        "name": "Fish Amritsari",
        "category": "Starters",
        "price": 450,
        "desc": "Chinese Non-Veg Starters"
      },
      {
        "id": 114,
        "name": "Lemon Fish",
        "category": "Starters",
        "price": 450,
        "desc": "Chinese Non-Veg Starters"
      },
      {
        "id": 115,
        "name": "Grilled Fish in Lemon butter Sauce",
        "category": "Starters",
        "price": 450,
        "desc": "Chinese Non-Veg Starters"
      },
      {
        "id": 116,
        "name": "Chinese Non-Veg Platter",
        "category": "Starters",
        "price": 650,
        "desc": "Chinese Non-Veg Starters"
      },
      {
        "id": 117,
        "name": "Garlic Naan",
        "category": "Breads & Rice",
        "price": 60,
        "desc": "Soft flatbread topped with garlic and butter"
      },
      {
        "id": 118,
        "name": "Butter Naan",
        "category": "Breads & Rice",
        "price": 50,
        "desc": "Traditional tandoor baked bread"
      }
    ]
    
};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create an order
app.post('/api/orders', (req, res) => {
    const order = { id: Date.now().toString(), ...req.body, status: 'Pending', createdAt: new Date().toISOString() };
    state.orders.push(order);
    io.emit('newOrder', order); // Live sync to admin
    res.json({ success: true, order });
});

// Update order status
app.put('/api/orders/:id', (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    const orderIndex = state.orders.findIndex(o => o.id === id);
    
    if (orderIndex !== -1) {
        state.orders[orderIndex].status = status;
        io.emit('orderUpdated', state.orders[orderIndex]);
        res.json({ success: true, order: state.orders[orderIndex] });
    } else {
        res.status(404).json({ success: false, msg: 'Order not found' });
    }
});

// Create a reservation
app.post('/api/reservations', (req, res) => {
    const reservation = { id: Date.now().toString(), ...req.body, status: 'Confirmed', createdAt: new Date().toISOString() };
    state.reservations.push(reservation);
    io.emit('newReservation', reservation); // Live sync to admin
    res.json({ success: true, reservation, csvUrl: `/api/reservations/${reservation.id}/csv` });
});

// Download CSV of a specific reservation
app.get('/api/reservations/:id/csv', (req, res) => {
    const r = state.reservations.find(resv => resv.id === req.params.id);
    if (!r) return res.status(404).send('Reservation not found');
    
    const csvContent = `ID,Name,Email,Date,Time,Guests,Phone,Status\n"${r.id}","${r.name}","${r.email}","${r.date}","${r.time}","${r.guests}","${r.phone || ''}","${r.status}"`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=Reservation-${r.id}.csv`);
    res.send(csvContent);
});

// Settings API
app.get('/api/settings', (req, res) => {
    res.json(state.settings);
});

app.post('/api/settings', (req, res) => {
    state.settings.deliveryFee = req.body.deliveryFee || state.settings.deliveryFee;
    state.settings.bannerText = req.body.bannerText || state.settings.bannerText;
    io.emit('settingsUpdated', state.settings);
    res.json({ success: true, settings: state.settings });
});

// Menu API
app.get('/api/menu', (req, res) => {
    res.json(state.menu);
});

app.post('/api/menu', (req, res) => {
    const newItem = { id: Date.now(), ...req.body };
    state.menu.push(newItem);
    io.emit('menuUpdated', state.menu);
    res.json({ success: true, menu: state.menu });
});

app.put('/api/menu/:id', (req, res) => {
    const item = state.menu.find(m => m.id === parseInt(req.params.id));
    if (item) {
        if (req.body.price) item.price = parseInt(req.body.price);
        if (req.body.name) item.name = req.body.name;
        io.emit('menuUpdated', state.menu);
        res.json({ success: true, item });
    } else {
        res.status(404).json({ success: false, msg: 'Item not found' });
    }
});

// Get all data for admin panel initialization
app.get('/api/data', (req, res) => {
    res.json(state);
});

// Socket connection for live dashboard sync
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

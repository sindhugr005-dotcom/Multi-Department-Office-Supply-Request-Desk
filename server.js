const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Request = require("./Request");

const app = express();

app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/officedesk")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const inventory = {
    Keyboard: 20,
    Mouse: 35,
    Monitor: 10,
    Pen: 150,
};

// Home
app.get("/", (req, res) => {
    res.send("Office Supply Backend Running");
});

app.get("/inventory", (req, res) => {
    res.json(inventory);
});

// Save Request
app.post("/request", async (req, res) => {
    const { item, quantity, reason } = req.body;
    const requestedQuantity = Number(quantity);

    if (!item || !reason || !requestedQuantity || requestedQuantity <= 0) {
        return res.status(400).json({ message: "Invalid request payload." });
    }

    if (!Object.prototype.hasOwnProperty.call(inventory, item)) {
        return res.status(400).json({ message: "Requested item is not available." });
    }

    const request = new Request({
        item,
        quantity: requestedQuantity,
        reason,
        status: "Pending",
    });

    await request.save();

    res.json({
        message: "Request Submitted Successfully",
        request,
    });
});

// Get All Requests

app.get("/request", async (req, res) => {
    const data = await Request.find();
    res.json(data);
});

app.put("/request/:id/approve", async (req, res) => {
    const request = await Request.findById(req.params.id);
    if (!request) {
        return res.status(404).json({ message: "Request not found" });
    }

    if (request.status === "Approved") {
        return res.status(400).json({ message: "Request already approved." });
    }

    const available = inventory[request.item] ?? 0;
    if (request.quantity > available) {
        return res.status(400).json({
            message: `Cannot approve ${request.quantity} ${request.item}(s). Only ${available} available in inventory.`,
        });
    }

    inventory[request.item] = available - request.quantity;
    request.status = "Approved";
    await request.save();

    res.json({ message: "Request approved", request, inventory });
});

app.listen(5000, () => {
    console.log("Server Running on Port 5000");
});
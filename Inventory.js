const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({

    item: String,

    stock: Number

});

module.exports = mongoose.model("Inventory", InventorySchema);
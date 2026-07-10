const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({

    item: String,

    quantity: Number,

    reason: String,

    status: {

        type: String,

        default: "Pending"

    }

});

module.exports = mongoose.model("Request", RequestSchema);

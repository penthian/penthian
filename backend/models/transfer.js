const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
    to: {
        type: String,
        required: true,                 
    },
    from: {
        type: String,
        required: true, 
    },
    amount: {
        type: String,
        required: true, 
    },
    status: {
        type: String,
        required: true, 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transfer', transferSchema);
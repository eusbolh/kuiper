const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const peerSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    minLength: 16,
    maxLength: 16,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
  },
}, {
  timestamps: true,
});

const Peer = mongoose.model('Peer', peerSchema);

module.exports = Peer;
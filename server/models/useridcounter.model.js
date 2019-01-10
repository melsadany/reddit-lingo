const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserIDCounterSchema = new Schema({
  nextID: Number
})

module.exports = mongoose.model('UserIDCounter', UserIDCounterSchema)

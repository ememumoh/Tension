const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FileSchema = new Schema({
  filename: {
    type: String,
    required: true
  }
}, { timestamps: true });

const File = module.exports = mongoose.model('File', FileSchema);
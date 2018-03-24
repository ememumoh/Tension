'use strict';
const mongoose = require('mongoose');

// Article Schema
const ArticleSchema = mongoose.Schema({
  headline:{
    type: String,
    required: true
  },
  author:{
    type: String,
    required: true
  },
  featuredImage: {
    type: String,
    required: true
  },
  date:{
    type: Date,
    default: Date.now()
  },
  category: {
    type: [{
      type: String,
      enum: ['Politics', 'Sports', 'Technology', 'Finance', 'Entertainment', 'Gaming']
    }]
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true
  },
}, { timestamps: true });

const Article = module.exports = mongoose.model('Article', ArticleSchema);

const mongoose = require('mongoose');
const posts = require('./posts');
mongoose.connect('mongodb://127.0.0.1:27017/wavy');

const userSchema = new mongoose.Schema({
  name:String,
  password: String,
  email:String,
  age:Number,
  posts:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: posts
  }]
});

module.exports = mongoose.model('user',userSchema);
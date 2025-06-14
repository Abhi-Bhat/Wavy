const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema({
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    name:String,
    date:{
        type:Date,
        default:Date.now
    },
    content:String,
    image:String,
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }]
});

module.exports = mongoose.model('posts',postsSchema);
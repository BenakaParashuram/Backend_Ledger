const mongoose = require('mongoose')

const tokenBlacklistSchema = new mongoose.Schema({
    token : {
        type : String,
        required : [true , "Token is required to blacklist"],
        unique : [true , "Token is aldready blacklisted"]
    },
}, {
    timestamps : true
})

tokenBlacklistSchema.index({createdAt: 1},{
    expireAfterSeconds: 60 * 60 * 24 * 3 //3days
})

const tokenBlacklistModel = mongoose.model("tokanBlacklist" , tokenBlacklistSchema)
module.exports = tokenBlacklistModel
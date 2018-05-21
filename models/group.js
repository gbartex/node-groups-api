const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var groupSchema = Schema({
  _id: Schema.Types.ObjectId,
  name: {
    type: String,
    require: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  users: [{ type: Schema.Types.ObjectId, ref: "User" }]
});

groupSchema.pre("save", function(next) {
  let group = this;
  if (group.isModified("users")) {
    let uniques = [...new Set(group.users.map(x => x.toString()))].map(
      x => new mongoose.Types.ObjectId(x)
    );
    group.users = [...uniques];
    next();
  } else {
    next();
  }
});

let Group = mongoose.model("Group", groupSchema);

module.exports = { Group };

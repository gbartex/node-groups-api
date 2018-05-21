const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const _ = require("lodash");
const { Group } = require("./group");

let userSchema = Schema({
  _id: Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
    minlength: 3,
    trim: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  dateOfBirth: { type: Date, default: null },
  lastModified: { type: Date, default: Date.now() },
  groups: [{ type: Schema.Types.ObjectId, ref: "Group" }]
});

userSchema.methods.toJSON = function() {
  let user = this;
  let userObject = user.toObject();
  return _.pick(userObject, [
    "_id",
    "name",
    "firstName",
    "lastName",
    "dateOfBirth"
  ]);
};

userSchema.pre("save", function(next) {
  let user = this;
  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt).then(hash => {
        user.password = hash;
        next();
      });
    });
  } else if (user.isModified("groups")) {
    let uniques = [...new Set(user.groups.map(x => x.toString()))].map(
      x => new mongoose.Types.ObjectId(x)
    );
    user.groups = [...uniques];
    next();
  } else {
    next();
  }
});

let User = mongoose.model("User", userSchema);

module.exports = { User };

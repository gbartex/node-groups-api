const mongoose = require("mongoose");
const router = require("express").Router();

const _ = require("lodash");
const { ObjectID } = require("mongodb");
let { User } = require("./../models/user");
let { Group } = require("./../models/group");

// GET users
router.get("/users", (req, res) => {
  User.find({})
    .then(users => {
      if (!users) {
        return res.status(404).send();
      }
      res.send(users);
    })
    .catch(e => res.status(400).send());
});

// GET user by id
router.get("/users/:id", (req, res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id)) return res.status(404).send();
  User.findOne({
    _id: id
  })
    .then(user => {
      if (!user) {
        return res.status(404).send();
      }
      res.send(user);
    })
    .catch(e => res.status(400).send());
});

// POST create new user
router.post("/users", (req, res) => {
  let body = {
    name: req.body.name,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: req.body.password,
    dateOfBirth: req.body.dateOfBirth
  };
  let user = new User({ _id: new mongoose.Types.ObjectId(), ...body });
  user.save().then(
    user_created => {
      res.send(user_created);
    },
    e => {
      console.log(e);
      res.status(400).send(e);
    }
  );
});

router.delete("/users/:id", async (req, res) => {
  try {
    let id = req.params.id;
    if (!ObjectID.isValid(id)) throw new Error(404);
    let user_deleted = await User.findOneAndRemove({ _id: id });
    if (!user_deleted) {
      throw new Error(404);
    }
    res.send(user_deleted);
  } catch (e) {
    res.status(e.message).send();
  }
});

router.patch("/users/:id", async (req, res) => {
  let id = req.params.id;
  try {
    if (!ObjectID.isValid(id)) return res.status(404).send();
    let body = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: req.body.password,
      dateOfBirth: req.body.dateOfBirth,
      lastModified: Date.now()
    };

    let user = await User.findOneAndUpdate(
      { _id: id },
      { $set: body },
      { new: true }
    );
    if (!user) return res.status(404).send();
    res.send(user);
  } catch (e) {
    res.status(e.message).send();
  }
});

router.post("/users/:id/group/:id_group", async (req, res) => {
  let id = req.params.id;
  let id_group = req.params.id_group;
  try {
    if (!ObjectID.isValid(id) || !ObjectID.isValid(id_group))
      return res.status(404).send();

    let _user = await User.findOne({ _id: id });
    if (!_user) return res.status(404).send();
    let _group = await Group.findOne({ _id: id_group });
    if (!_group) return res.status(404).send();
    _group.users.push(_user._id);
    _group
      .save()
      .then(() => {
        _user.groups.push(_group._id);
        return _user.save();
      })
      .then(usr => {
        res.send(usr);
      });
  } catch (e) {
    res.status(e.message).send();
  }
});

router.delete("/users/:id/group/:id_group", async (req, res) => {
  let id = req.params.id;
  let id_group = req.params.id_group;
  try {
    if (!ObjectID.isValid(id) || !ObjectID.isValid(id_group))
      return res.status(404).send();

    let _user = await User.findOne({ _id: id });
    if (!_user) return res.status(404).send();
    let _group = await Group.findOne({ _id: id_group });
    if (!_group) return res.status(404).send();

    _group.users = _group.users.filter(
      x => x.toHexString() !== _user._id.toHexString()
    );
    _user.groups = _user.groups.filter(
      x => x.toHexString() !== _group._id.toHexString()
    );

    _group
      .save()
      .then(() => {
        return _user.save();
      })
      .then(usr => {
        res.send(usr);
      });
  } catch (e) {
    res.status(e.message).send();
  }
});

module.exports = router;

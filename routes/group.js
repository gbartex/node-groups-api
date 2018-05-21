const mongoose = require("mongoose");
const router = require("express").Router();

const _ = require("lodash");
const { ObjectID } = require("mongodb");
let { User } = require("./../models/user");
let { Group } = require("./../models/group");

// GET groups
router.get("/groups", (req, res) => {
  Group.find({})
    .then(groups => {
      if (!groups) {
        return res.status(404).send();
      }
      res.send(groups);
    })
    .catch(e => res.status(400).send());
});

// GET group by id
router.get("/groups/:id", (req, res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id)) return res.status(404).send();
  Group.findOne({
    _id: id
  })
    .then(group => {
      if (!group) {
        return res.status(404).send();
      }
      res.send(group);
    })
    .catch(e => res.status(400).send());
});

// POST create new group
router.post("/groups", (req, res) => {
  let body = {
    name: req.body.name
  };
  let group = new Group({ _id: new mongoose.Types.ObjectId(), ...body });
  group.save().then(
    group_created => {
      res.send(group_created);
    },
    e => {
      res.status(400).send(e);
    }
  );
});

router.delete("/groups/:id", async (req, res) => {
  try {
    let id = req.params.id;
    if (!ObjectID.isValid(id)) throw new Error(404);
    let group_deleted = await Group.findOneAndRemove({ _id: id });
    if (!group_deleted) {
      throw new Error(404);
    }

    let array_promises_users = [];
    for (let i = 0; i < group_deleted.users.length; i++) {
      let _user = await User.findById(group_deleted.users[i].toHexString());
      // console.log("found", _user);
      if (_user) {
        _user.groups.splice(_user.groups.indexOf(group_deleted._id), 1);
        array_promises_users.push(_user.save());
      }
    }
    await Promise.all(array_promises_users);
    res.send(group_deleted);
  } catch (e) {
    res.status(e.message).send();
  }
});

module.exports = router;

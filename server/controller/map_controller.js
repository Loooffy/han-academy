const Map = require('../model/map_model');
const pug = require('pug');

const getTree = async (req, res) => {
  const data = await Map.getTree(req.user_id);
  console.log(data);
  res.json(data);
};

const postTree = async (req, res) => {
  const {code, correct} = req.body;
  const data = await Map.postTree(req.user_id, code, correct);
  console.log(data);
  res.json(data);
};

const postMap = async (req, res) => {
  const {code, xy, text} = req.body;
  try {
    const data = await Map.postMap(req.user_id, code, xy, text);
    res.json(data);
  } catch (err) {
    console.log(err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.json({err: 'dup_entry'});
    } else {
      res.status(500).send({err: 'server_err'});
    }
    return;
  }
};

module.exports = {
  getTree,
  postTree,
  postMap,
};

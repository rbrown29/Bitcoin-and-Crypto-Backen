const express = require('express');
const router = express.Router();
const Comment = require('../models/comments.js');

router.get('/', async (req, res) => {
  try {
    const articleUrl = req.query.articleUrl;
    let foundComments;

    if (articleUrl) {
      foundComments = await Comment.find({ articleUrl: decodeURIComponent(articleUrl) });
    } else {
      foundComments = await Comment.find({});
    }

    res.json(foundComments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const createdComment = await Comment.create(req.body);
    res.json(createdComment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedComment = await Comment.findByIdAndRemove(req.params.id);
    res.json(deletedComment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

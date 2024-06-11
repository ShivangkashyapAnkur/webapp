const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Item = require('../models/Item');

router.get('/', ensureAuthenticated, (req, res) => {
    Item.find({ user: req.user.id }).sort({ name: 1 }).then(items => {
        res.render('items/index', { items });
    });
});

router.get('/new', ensureAuthenticated, (req, res) => res.render('items/new'));

router.post('/', ensureAuthenticated, (req, res) => {
    const { name, description } = req.body;
    const newItem = new Item({ name, description, user: req.user.id });

    newItem.save().then(item => {
        req.flash('success_msg', 'Item added');
        res.redirect('/items');
    });
});

router.get('/:id/edit', ensureAuthenticated, (req, res) => {
    Item.findById(req.params.id).then(item => {
        if (item.user != req.user.id) {
            req.flash('error_msg', 'Not authorized');
            return res.redirect('/items');
        }
        res.render('items/edit', { item });
    });
});

router.put('/:id', ensureAuthenticated, (req, res) => {
    Item.findById(req.params.id).then(item => {
        if (item.user != req.user.id) {
            req.flash('error_msg', 'Not authorized');
            return res.redirect('/items');
        }
        item.name = req.body.name;
        item.description = req.body.description;

        item.save().then(() => {
            req.flash('success_msg', 'Item updated');
            res.redirect('/items');
        });
    });
});

router.delete('/:id', ensureAuthenticated, (req, res) => {
    Item.findById(req.params.id).then(item => {
        if (item.user != req.user.id) {
            req.flash('error_msg', 'Not authorized');
            return res.redirect('/items');
        }
        item.remove().then(() => {
            req.flash('success_msg', 'Item removed');
            res.redirect('/items');
        });
    });
});

module.exports = router;

const express = require('express')
const router = express.Router()
const data = require('../data')
const userData = data.users

router.get('/', async (req, res) => {
    delete req.session.AuthCookie
    res.render('logout', {title: "Logged Out"})
})

module.exports = router;
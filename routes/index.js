
const testRoutes = require('./tests')
const userRoutes = require('./users')
const loginRoutes = require('./login')
const logoutRoutes = require('./logout')

const constructorMethod = (app) => {
    app.use('/login', loginRoutes)
    app.use('/logout', logoutRoutes)
    app.use('/tests', testRoutes)
    app.use('/profile', userRoutes)
    

    app.use('/', (req, res) => {
        if (req.session.AuthCookie) {
            res.render('home', { title: "TrviaFun", layout:"logged_in" })
        } else {
            res.render('home', { title: "TrviaFun", layout:"main" })
        }
    })

    app.use('*', (req, res) => {
        res.redirect('/')
    })
}

module.exports = constructorMethod;

const testRoutes = require('./tests')
const userRoutes = require('./users')

const constructorMethod = (app) => {
    app.use('/tests', testRoutes)
    app.use('/users', userRoutes)

    app.use('/', (req, res) => {
        res.render('home', { title: "TrviaFun", layout:"logged_in" })
    })

    app.use('*', (req, res) => {
        res.status(404).json({ error: 'Route not found' })
    })
}

module.exports = constructorMethod;
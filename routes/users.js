const { User } = require('../models/user')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Category } = require('../models/category')
const Product  = require('../models/product')

router.get('/', async (req, res) => {
    const userList = await User.find().select('-passwordbcrypt')

    if (!userList) {
        res.status(500).json({ success: false })
    }
    res.send(userList)
})

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordbcrypt')
    if (!user) {
        res.status(404).json({ success: false })
    }
    res.send(user)
})

router.post('/', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.passwordHash, salt)
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            passwordHash: hashedPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        })

        const savedUser = await user.save()

        if (!savedUser) {
            return res.status(500).send('Cannot create user')
        }

        res.status(201).send(savedUser)
    } catch (error) {
        console.error(error)
        res.status(500).send('Error creating user')
    }
})

router.put('/:id', async (req, res) => {
    const updatedData = req.body

    let user = await User.findByIdAndUpdate(req.params.id, updatedData, {
        new: true,
    })

    if (!user) {
        res.status(500).send('Cannot update User')
    }

    res.send(user)
})

router.delete('/:id', async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id)
    console.log(user)

    if (!user) {
        res.status(500).send({ success: false })
    } else {
        res.status(200).send({ success: true })
    }
})


router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        const secret = process.env.secret;
        
        if (!user) {
            return res.status(400).send('The user is not Found');
        }

        console.log('Entered password:', req.body.password);
        console.log('Stored hashed password:', user.passwordHash);

        const passwordMatch = await bcrypt.compare(req.body.password, user.passwordHash);
        if (passwordMatch) {
            const token = jwt.sign(
                { userId: user.id, isAdmin: user.isAdmin },
                secret,
                { expiresIn: '1d' }
            );

            console.log('Token generated:', token);  // Debugging token generation

            // Send the token and a success message to the frontend
            res.status(200).json({
                message: 'Login successful',
                token: token,
            });
        } else {
            return res.status(400).send('Invalid password');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Something went wrong. Please try again.');
    }
});



router.post('/register', async (req, res) => {
    try {
        const {
            password,
            confirmPassword,
            name,
            email,
            phone,
            street,
            apartment,
            zip,
            city,
            country,
            isAdmin,
        } = req.body
        console.log(req.body)
        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).send('Passwords do not match')
        }

        // Check if password is provided
        if (!password) {
            return res.status(400).send('Password is required')
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create new user
        const user = new User({
            name,
            email,
            passwordHash: hashedPassword, // Store the hashed password
            phone,
            isAdmin: isAdmin || false, // Ensure isAdmin defaults to false if not provided
            street,
            apartment,
            zip,
            city,
            country,
        })

        // Save the user to the database
        const savedUser = await user.save()

        // Check if the user was saved successfully
        if (!savedUser) {
            return res.status(500).send('Cannot create user')
        }

        // Redirect to login page
        res.redirect('/login')
    } catch (error) {
        console.error(error)
        res.status(500).send('Error creating user')
    }
})

router.get('/get/count', async (req, res) => {
    const userCount = await User.countDocuments()

    if (!userCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        userCount: userCount,
    })
})

module.exports = router

const express = require('express')
const router = express.Router()
const Product = require('../models/product')
const { Category } = require('../models/category')
const mongoose = require('mongoose')
const multer = require('multer')

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpeg': 'jpeg',
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('invalid Image Type')
        if (isValid) {
            uploadError = null
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const extension = FILE_TYPE_MAP[file.mimetype]
        const fileName = file.originalname.split(' ').join('-')
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    },
})
const upload = multer({ storage: storage })


router.get("/random" , async(req , res) =>{
    const isRandom = req.query.random === "true";

    let products;
    if(isRandom){
        products = await Product.aggregate([{$sample: {size:5}}])

    }else{
        products = await Product.find();
    }

    res.json(products)
})

router.get('/', async (req, res) => {
    let filter = {}
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') }
    }
    const productList = await Product.find(filter).populate('category')

    if (!productList) {
        res.status(500).json({ success: false })
    }

    res.send(productList)
})

router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category')

    if (!product) {
        res.status(500).json({ success: false })
    }
    res.send(product)
})

router.post('/', upload.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category)
    if (!category) {
        return res.status(400).send('invalid category')
    }
    const file = req.file
    if (!file) {
        return res.status(401).send('No image in the request')
    }

    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    let product = new Product({
        name: req.body.name,
        image: req.body.image,
        countInStock: req.body.countInStock,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })

    product = await product.save()
    if (!product) {
        return res.status(500).send('The product cannot be created')
    }

    res.send(product)
})

router.delete('/:id', async (req, res) => {
    const product = Product.findByIdAndDelete(req.params.id)

    if (product) {
        return res
            .status(200)
            .send({ success: true, message: 'Deleted item successfully' })
    } else {
        return res
            .status(404)
            .send({ success: true, message: "Can't delete item" })
    }
})

router.put('/:id', async (req, res) => {
    if (mongoose.isValidObjectId(req.params.id)) {
        res.status(404).send('invalid product Id')
    }
    const category = await Category.findById(req.body.category)
    if (!category) {
        return res.status(400).send('invalid category')
    }

    let product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            image: req.body.image,
            countInStock: req.body.countInStock,
            description: req.body.description,
            richDescription: req.body.richDescription,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        { new: true }
    )

    if (!product) {
        return res.status(500).send('The product cannot be updated')
    }

    res.send(product)
})

router.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments()

    if (!productCount) {
        res.status(500).json({ success: false })
    }
    res.send({ productCount })
})

router.get('/get/featured', async (req, res) => {
    const products = await Product.find({ isFeatured: true })

    if (!products) {
        res.status(500).json({ success: false })
    }
    res.send(products)
})

router.put(
    '/gallery-images/:id',
    upload.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).send({ message: 'Invalid Product Id' })
        }
        const files = req.files
        let imagePaths = []
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

        if(files){
            files.map(file => {
                imagePaths.push(`${basePath}${file.filename}`)
            })
        }
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images:imagePaths
            },
            { new: true }
        )

        if(!product){
            res.status(401).send("Cannot update product")

        }
        console.log(product.images)
        res.send(product)
    }
)

module.exports = router

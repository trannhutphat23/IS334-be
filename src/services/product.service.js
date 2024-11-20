const productModel = require('../models/product.model')
const uploadImage = require('../utils/uploadImage.utils')
const deleteImage = require('../utils/deleteImage.utils');
const cartModel = require('../models/cart.model');
const { BadRequestError } = require('../utils/error.response');

class ProductService {
    static addProduct = async (file, { name, type, description, category, discount }) => {
        try {
            const product = await productModel.findOne({ name }).lean();
            if (product) {
                return {
                    success: false,
                    message: "Already exist"
                }
            }

            if (type) {
                type = JSON.parse(type)
                
                const priceSizeL = type.find(ele => ele.size === "L")
                const priceSizeM = type.find(ele => ele.size === "M")
                const priceSizeS = type.find(ele => ele.size === "S")

                if (priceSizeL) {
                    if (priceSizeM && priceSizeL.price >= priceSizeM.price) {
                        return new BadRequestError('Price of size L must be less than or equal to price of size M')
                    }
                    
                    if (priceSizeS && priceSizeL.price >= priceSizeS.price) {
                        return new BadRequestError('Price of size L must be less than or equal to price of size S')
                    }
                }else {
                    if (priceSizeM.price >= priceSizeS.price) {
                        return new BadRequestError('Price of size M must be less than or equal to price of size S')
                    }
                }

                if (priceSizeM) {
                    if (priceSizeS && priceSizeM.price >= priceSizeS.price) {
                        return new BadRequestError('Price of size M must be less than or equal to price of size L')
                    }
                }
            }

            const cloudinaryFolder = 'Cafe/Product';
            const imageLink = await uploadImage(file.path, cloudinaryFolder);

            const newProduct = new productModel({
                "image": imageLink,
                name, type, description, category, discount
            })

            const savedProduct = await newProduct.save()

            return savedProduct
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static getProduct = async () => {
        try {
            const products = await productModel.find({})

            return products
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static getProductID = async ({ id }) => {
        try {
            const product = await productModel.findById(id)

            if (!product) {
                return {
                    success: false,
                    message: "wrong product"
                }
            }

            return product
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static updateProduct = async (id, file, { type, description, category, discount,isStock }) => {
        try {
            const product = await productModel.findById(id)

            if (!product) {
                return {
                    success: false,
                    message: "wrong product"
                }
            }

            if (file) {
                const cloudinaryFolder = 'Cafe/Product';
                const imageLink = await uploadImage(file.path, cloudinaryFolder);

                const linkArr = product.image.split('/')
                const imgName = linkArr[linkArr.length - 1]
                const imgID = imgName.split('.')[0]
                const result = "Cafe/Product/" + imgID
                await deleteImage(result)

                product.image = imageLink
            }

            if (type) {
                type = JSON.parse(type)

                const priceSizeL = type.find(ele => ele.size === "L")
                const priceSizeM = type.find(ele => ele.size === "M")
                const priceSizeS = type.find(ele => ele.size === "S")

                if (priceSizeL) {
                    if (priceSizeM && priceSizeL.price >= priceSizeM.price) {
                        return new BadRequestError('Price of size L must be less than or equal to price of size M')
                    }
                    
                    if (priceSizeS && priceSizeL.price >= priceSizeS.price) {
                        return new BadRequestError('Price of size L must be less than or equal to price of size S')
                    }
                }else {
                    if (priceSizeM.price >= priceSizeS.price) {
                        return new BadRequestError('Price of size M must be less than or equal to price of size S')
                    }
                }

                if (priceSizeM) {
                    if (priceSizeS && priceSizeM.price >= priceSizeS.price) {
                        return new BadRequestError('Price of size M must be less than or equal to price of size L')
                    }
                }

                product.type = type
            }

            if (description)
                product.description = description

            if (category)
                product.category = category

            if (discount)
                product.discount = discount

            if (isStock)
                product.isStock = isStock

            const savedProduct = await product.save()

            const carts = await cartModel.find({"items.product": savedProduct.id})

            if (carts) {
                for(let cart of carts){
                    cart.items.forEach(async (item, index) => {
                        if (savedProduct.type.some(t => t.size == item.size)) {
                            savedProduct.type.forEach(t => {
                                if(t.size == item.size){
                                    item.price = t.price
                                    item.discount = savedProduct.discount
                                }
                            })
                        }
                        else{
                            cart.items.splice(index, 1)
                        }
                    })

                    await cart.save()
                }
            }

            return savedProduct
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static deleteProduct = async ({ id }) => {
        try {
            const product = await productModel.findByIdAndDelete(id)

            const linkArr = product.image.split('/')
            const imgName = linkArr[linkArr.length - 1]
            const imgID = imgName.split('.')[0]
            const result = "Cafe/Product/" + imgID
            await deleteImage(result)

            return {
                success: true,
                message: "delete successfully"
            } 
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }
}

module.exports = ProductService
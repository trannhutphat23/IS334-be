const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

const productSchema = new Schema(
    {
        image: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        type: [
            {
                _id: false,
                size: {
                    type: String,
                    enum: ["L", "M", "S"],
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            }
        ],
        description: {
            type: String,
            required: true,
            trim: true,
            max: 1000,
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true,

        },
        // by %
        discount: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        isStock: {
            type: Boolean,
            default: true,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME
    }
);

module.exports = mongoose.model(DOCUMENT_NAME, productSchema);
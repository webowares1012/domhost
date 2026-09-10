import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
    },
    {
        timestamps: true,
    },
);

const Category: Model<ICategory> =
    mongoose.models.Category ||
    mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
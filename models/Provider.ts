import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProvider extends Document {
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProviderSchema = new Schema<IProvider>(
    {
        name: {
            type: String,
            required: [true, "Provider name is required"],
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

const Provider: Model<IProvider> =
    mongoose.models.Provider ||
    mongoose.model<IProvider>("Provider", ProviderSchema);

export default Provider;
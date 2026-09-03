import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDomain extends Document {
  domainName: string;
  category: string;
  purchasedFrom: string;
  purchaseDate?: Date;
  expiryDate: Date;
  status: string;
  renewalCost: number;
  currency: string;
  autoRenew: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DomainSchema = new Schema<IDomain>(
  {
    domainName: {
      type: String,
      required: [true, "Domain name is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
    },

    purchasedFrom: {
      type: String,
      required: [true, "Purchased from is required"],
    },

    purchaseDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },

    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },

    status: {
      type: String,
      enum: {
        values: [
          "deleted",
        ],
        message: "{VALUE} is not a valid status",
      },

    },

    renewalCost: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    autoRenew: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);


const Domain: Model<IDomain> =
  mongoose.models.Domain || mongoose.model<IDomain>("Domain", DomainSchema);

export default Domain;

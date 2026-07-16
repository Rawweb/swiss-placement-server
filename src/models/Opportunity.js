import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    position: { type: String, required: true, trim: true },

    disciplines: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one discipline is required',
      },
    },

    requirements: { type: String, required: true, trim: true },

    state: { type: String, required: true, trim: true },

    city: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const Opportunity = mongoose.model('Opportunity', opportunitySchema);

export default Opportunity;

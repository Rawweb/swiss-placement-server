import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true,
    },

    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Accepted', 'Declined'],
      default: 'Pending',
    },
  },
  { timestamps: true },
);

// Stop the same student applying to the same opening twice.
// This makes the student+opportunity pair unique across the collection.
applicationSchema.index({ student: 1, opportunity: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;

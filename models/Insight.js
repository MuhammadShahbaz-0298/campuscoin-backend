import mongoose from "mongoose";

const insightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: { type: String, required: true },
    headline: { type: String, default: "" },
    summaryText: { type: String, required: true },
    tipText: { type: String, required: true },
    footerText: { type: String, default: "" },
    metrics: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    isBookmarked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

insightSchema.index({ userId: 1, month: -1 });

export default mongoose.model("Insight", insightSchema);

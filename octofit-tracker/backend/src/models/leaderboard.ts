import { model, models, Schema } from 'mongoose';

const leaderboardSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    points: { type: Number, required: true, min: 0, default: 0 },
    activitiesCompleted: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true },
);

const Leaderboard = models.Leaderboard || model('Leaderboard', leaderboardSchema);

export default Leaderboard;

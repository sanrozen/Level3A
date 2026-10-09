import { model, models, Schema } from 'mongoose';

const workoutSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    activityType: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    suggestedFor: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

const Workout = models.Workout || model('Workout', workoutSchema);

export default Workout;

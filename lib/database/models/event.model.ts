import { Document, Schema, model, models } from "mongoose";

export interface IEvent extends Document {
  _id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  startDateTime?: Date;
  endDateTime?: Date;
  isFree?: boolean;
  location?: string;
  category?: string;
  eventType: 'FREE' | 'PAID';
  price: number;
  totalSeats: number;
  availableSeats: number;
  createdBy: string;
  isPublished: boolean;
  createdAt: Date;
}

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  startDateTime: { type: Date },
  endDateTime: { type: Date },
  isFree: { type: Boolean, default: false },
  location: { type: String },
  eventType: { type: String, enum: ['FREE', 'PAID'], default: 'FREE' },
  price: { type: Number, default: 0 },
  totalSeats: { type: Number, default: 0 },
  availableSeats: { type: Number, default: 0 },
  code: { type: String, unique: true, index: true },
  url: { type: String },
  urlSlug: { type: String, unique: true, index: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  isPublic: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

const Event = models.Event || model('Event', EventSchema);

export default Event;
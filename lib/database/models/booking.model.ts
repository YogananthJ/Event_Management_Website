import { Schema, model, models } from 'mongoose';

const BookingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  stripePaymentId: { type: String, default: null },
  paymentStatus: { type: String, enum: ['pending','paid','failed','free'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const Booking = models.Booking || model('Booking', BookingSchema);

export default Booking;

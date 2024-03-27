import { ObjectId } from 'mongoose';
import Stripe from 'stripe';

export interface JwtPayload {
  user: {
    _id: ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profilePicture: string;
  };
}

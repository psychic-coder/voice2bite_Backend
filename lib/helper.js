
import jwt from "jsonwebtoken";

import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "rajkrishnapriyanshiharshitarohitbhavishya"




  // console.log(REDIS_URL)
  // export const redis = new Redis({
  //   host: "https://gentle-pup-12315.upstash.io",
  //   token:TOKEN
  // })







  export function generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }





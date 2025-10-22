
import jwt from "jsonwebtoken";

import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "rajkrishnapriyanshiharshitarohitbhavishya"












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





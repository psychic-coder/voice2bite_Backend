FROM node:20
WORKDIR /usr/src/app

# Install deps first for caching
COPY package*.json ./
RUN npm install

# Copy only Prisma files (for better caching)
COPY prisma ./prisma
RUN npx prisma generate

# Copy everything else (except .env if in .dockerignore)
COPY . .

# Optional: Copy .env if it exists (dev only)
COPY .env* .env*
RUN if [ -f .env ]; then echo "Using .env"; else echo "No .env found" >&2; fi

EXPOSE 5000
CMD ["npm", "run", "dev"]
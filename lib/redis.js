import { createClient } from "redis"

const TOKEN=process.env.UPSTASH_REDIS_TOKEN||"ATAbAAIjcDFjMWY3NWU2OGQwYjA0ZTAzOWM5MmU3MzJmMDJlY2MzM3AxMA"
const REDIS_URL=process.env.UPSTASH_REDIS_URL||"https://gentle-pup-12315.upstash.io"


const client = createClient({
  url: `rediss://default:${TOKEN}@gentle-pup-12315.upstash.io:6379`,
});

client.on('error', (err) => {
  console.error(' Redis Client Error:', err);
});

client.on('connect', () => {
  console.log('Redis client is trying to connect...');
});

client.on('ready', () => {
  console.log(' Redis client connected successfully!');
});

await client.connect();
  export default client
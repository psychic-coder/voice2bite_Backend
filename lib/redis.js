import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://gentle-pup-12315.upstash.io",
  token: "ATAbAAIjcDFjMWY3NWU2OGQwYjA0ZTAzOWM5MmU3MzJmMDJlY2MzM3AxMA",
});

export default redis;

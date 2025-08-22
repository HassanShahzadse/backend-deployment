// lib/redis.js
const Redis = require("ioredis");

// Ako nema REDIS_URL, koristimo stub (bez spajanja na Redis)
const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  console.log("ℹ️ Redis disabled (REDIS_URL not set) — using in-memory stub.");
  // Minimalni stub s istim sučeljem koje koristimo u kodu
  class RedisStub {
    constructor() {
      this.__enabled = false;
    }
    async mget() {
      return [null, null]; // simulira cache miss
    }
    async set() {
      return "OK";
    }
    multi() {
      // chainable API: .set().set().exec()
      const chain = {
        set() {
          return chain;
        },
        exec: async () => [],
      };
      return chain;
    }
    async incr() {}
    async incrby() {}
    async decr() {}
    async decrby() {}
    on() {} // ignoriraj evente
  }
  module.exports = new RedisStub();
} else {
  const redis = new Redis(REDIS_URL, {
    lazyConnect: false,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    // Ako se ne može spojiti, ne spamaj beskonačno:
    retryStrategy(times) {
      const delay = Math.min(1000 * Math.pow(2, times), 15000);
      return delay; // eksponencijalni backoff
    },
  });

  redis.__enabled = true;

  redis.on("connect", () => {
    console.log("✅ Redis connected");
  });

  redis.on("error", (err) => {
    // Logiraj jednom u X sekundi ako treba dodatno prigušenje logova
    console.error("❌ Redis error:", err);
  });

  module.exports = redis;
}

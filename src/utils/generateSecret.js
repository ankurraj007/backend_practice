import crypto from "crypto";

// Generate 64 random bytes (512 bits) and convert to hex
const secret = crypto.randomBytes(64).toString("hex");
console.log("Your new JWT secret:", secret);

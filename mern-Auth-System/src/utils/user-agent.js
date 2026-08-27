/**
 * Utility functions to extract IP address, User-Agent, Device, Browser, and Operating System from Express Request objects.
 */

function getIpAddress(req) {
  if (!req) return "Unknown";
  return (
    req.ip ||
    req.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "Unknown"
  );
}

function getUserAgent(req) {
  if (!req) return "Unknown";
  return req.headers?.["user-agent"] || req.get?.("User-Agent") || "Unknown";
}

function getDevice(userAgent) {
  if (!userAgent || userAgent === "Unknown") {
    return "Unknown";
  }

  if (/mobile/i.test(userAgent)) {
    return "Mobile";
  }

  if (/tablet/i.test(userAgent)) {
    return "Tablet";
  }

  if (/windows|macintosh|linux/i.test(userAgent)) {
    return "Desktop";
  }

  return "Unknown";
}

function getBrowser(userAgent) {
  if (!userAgent || userAgent === "Unknown") {
    return "Unknown";
  }

  if (/edg/i.test(userAgent)) {
    return "Microsoft Edge";
  }

  if (/chrome/i.test(userAgent)) {
    return "Google Chrome";
  }

  if (/firefox/i.test(userAgent)) {
    return "Mozilla Firefox";
  }

  if (/safari/i.test(userAgent)) {
    return "Safari";
  }

  if (/postmanruntime/i.test(userAgent)) {
    return "Postman";
  }

  return "Unknown";
}

function getOperatingSystem(userAgent) {
  if (!userAgent || userAgent === "Unknown") {
    return "Unknown";
  }

  if (/windows/i.test(userAgent)) {
    return "Windows";
  }

  if (/android/i.test(userAgent)) {
    return "Android";
  }

  if (/iphone|ipad|ios/i.test(userAgent)) {
    return "iOS";
  }

  if (/macintosh|mac os/i.test(userAgent)) {
    return "macOS";
  }

  if (/linux/i.test(userAgent)) {
    return "Linux";
  }

  return "Unknown";
}

function parseRequestMetadata(req) {
  const userAgent = getUserAgent(req);
  const ipAddress = getIpAddress(req);
  const device = getDevice(userAgent);
  const browser = getBrowser(userAgent);
  const operatingSystem = getOperatingSystem(userAgent);

  return {
    ipAddress,
    userAgent,
    device,
    browser,
    operatingSystem,
  };
}

module.exports = {
  getIpAddress,
  getUserAgent,
  getDevice,
  getBrowser,
  getOperatingSystem,
  parseRequestMetadata,
};

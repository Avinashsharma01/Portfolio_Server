import Razorpay from "razorpay";

export const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret || key_id.includes("YourRazorpayKeyIdHere")) {
    console.warn("⚠️ Razorpay keys are not configured in .env file.");
  }

  return new Razorpay({
    key_id: key_id || "rzp_test_placeholder",
    key_secret: key_secret || "placeholder_secret",
  });
};

export default getRazorpayInstance;

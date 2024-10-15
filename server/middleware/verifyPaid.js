const stripe = require("stripe")(process.env.STRIPE_PRIVATE);
const User = require("../model/user");

const verifyPaid = async (req, res, next) => {
  // Check if this user session has already verified the paid status
  if (!req.session.checkedPaid) {
    try {
      const { email } = req.user;

      // Search for the Stripe customer by email
      const existingCustomers = await stripe.customers.search({
        query: `email:"${email}"`,
      });

      if (existingCustomers.data.length === 0) {
        // If no Stripe customer is found, update isPaid to false in the database and continue
        await User.findOneAndUpdate({ email: email }, { isPaid: false });
        console.log(
          `No Stripe customer found for email: ${email}, isPaid updated to false.`
        );
      } else {
        // Get the first matching customer (since email should be unique)
        const customer = existingCustomers.data[0];

        // Fetch subscriptions for the customer
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: "active", // Only check for active subscriptions
        });

        if (subscriptions.data.length > 0) {
          // If there's an active subscription, update isPaid to true in the database
          await User.findOneAndUpdate({ email: email }, { isPaid: true });
          console.log(
            `Active subscription found for email: ${email}, isPaid updated to true.`
          );
        } else {
          // No active subscriptions found, update isPaid to false
          await User.findOneAndUpdate({ email: email }, { isPaid: false });
          console.log(
            `No active subscription for email: ${email}, isPaid updated to false.`
          );
        }
      }

      // Mark the session as having checked the paid status
      req.session.checkedPaid = true;

      return next(); // Continue to the next middleware or route
    } catch (error) {
      console.error("Error in verifyPaid middleware:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    // If already checked, proceed without making further API calls
    return next();
  }
};

module.exports = verifyPaid;

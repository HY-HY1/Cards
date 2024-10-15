const express = require('express');
const route = express.Router();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE);
const verifyToken = require('../middleware/verifyToken');

route.post('/subscription', verifyToken, async (req, res) => {
  try {
    const { priceId } = req.body;
    const email = req.user.email;

    // Search for an existing customer by email
    const existingCustomers = await stripe.customers.search({
      query: `email:'${email}'`,
    });

    let customer;
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];

      // Check for any existing active or incomplete subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'all', // Check all subscription statuses
      });

      const activeOrIncompleteSubscription = subscriptions.data.find(sub => 
        sub.status === 'active' || sub.status === 'incomplete'
      );

      // If customer has an active or incomplete subscription, prevent creating a new one
      if (activeOrIncompleteSubscription) {
        return res.status(400).send({
          error: 'You already have an active or pending subscription.',
        });
      }

    } else {
      // No customer found, create a new customer
      customer = await stripe.customers.create({
        email: email,
      });
    }

    // Create a Checkout Session for the subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    // Return the session URL to redirect the user to Stripe Checkout
    res.status(200).send({
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error('Error creating Stripe Checkout Session:', error);
    res.status(500).send({ error: error.message });
  }
});

module.exports = route;

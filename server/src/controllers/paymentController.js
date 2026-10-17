const Razorpay = require('razorpay');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const order = await razorpay.orders.create({
      amount: Math.round(booking.totalAmount * 100), // in paise
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      notes: { bookingId, customerId: req.user.id },
    });

    await prisma.payment.create({
      data: {
        bookingId,
        providerId: booking.providerId,
        amount: booking.totalAmount,
        platformFee: booking.platformFee,
        providerEarning: booking.providerEarning,
        welfareFund: booking.totalAmount * (parseFloat(process.env.WELFARE_FUND_PERCENT || '2') / 100),
        razorpayOrderId: order.id,
        status: 'PENDING',
      },
    });

    res.json({ success: true, data: { orderId: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID } });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const payment = await prisma.payment.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: { status: 'SUCCESS', razorpayPaymentId: razorpay_payment_id },
    });

    // Update welfare fund for provider
    if (payment.providerId) {
      await prisma.welfareFund.create({
        data: {
          providerId: payment.providerId,
          amount: payment.welfareFund,
          type: 'CONTRIBUTION',
          description: 'Automatic contribution from booking payment',
        },
      });
      await prisma.provider.update({
        where: { id: payment.providerId },
        data: { welfareContribution: { increment: payment.welfareFund } },
      });
    }

    res.json({ success: true, message: 'Payment verified successfully', data: payment });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const provider = req.user.role === 'PROVIDER'
      ? await prisma.provider.findUnique({ where: { userId: req.user.id } })
      : null;

    const where = provider ? { providerId: provider.id } : { booking: { customerId: req.user.id } };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { booking: { include: { service: true } } },
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({ success: true, data: payments, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get payment history' });
  }
};

module.exports = { createOrder, verifyPayment, getPaymentHistory };

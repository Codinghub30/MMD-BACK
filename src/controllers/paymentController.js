import Payment from "../models/Payment.js";
import dotenv from 'dotenv';
import { generatePaytmChecksum,verifyPaytmChecksum } from "../utils/helperFunc.js";
import Lead from "../models/Lead.js";
dotenv.config({ path: "../../.env" });

// ✅ Initiate Paytm Payment
export const initiatePayment = async (req, res) => {
  try {
    const { customerId, amount } = req.body;
    if (!customerId || !amount) {
      return res.status(400).json({ message: "Customer ID and amount are required." });
    }

    const orderId = "ORDER" + Math.floor(10000 + Math.random() * 90000);

    // Paytm Parameters
    const paytmParams = {
      MID: process.env.PAYTM_MID,
      WEBSITE: process.env.PAYTM_WEBSITE,
      INDUSTRY_TYPE_ID: process.env.PAYTM_INDUSTRY_TYPE,
      CHANNEL_ID: process.env.PAYTM_CHANNEL_ID,
      ORDER_ID: orderId,
      CUST_ID: customerId,
      TXN_AMOUNT: amount,
      CALLBACK_URL: process.env.PAYTM_CALLBACK_URL,
    };

    paytmParams["CHECKSUMHASH"] = generatePaytmChecksum(paytmParams, process.env.PAYTM_MERCHANT_KEY);

 
    await new Payment({ orderId, customerId, amount }).save();

  
    const paymentForm = `
      <html>
      <head>
          <title>Redirecting to Paytm...</title>
      </head>
      <body onload="document.paytmForm.submit();">
          <h2>Redirecting to Paytm Payment Gateway...</h2>
          <form method="POST" action="${process.env.PAYTM_TRANSACTION_URL}" name="paytmForm">
              ${Object.entries(paytmParams)
                .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
                .join("\n")}
          </form>
      </body>
      </html>
    `;

    res.send(paymentForm);
  } catch (error) {
    console.error("❌ Payment Error:", error);
    res.status(500).json({ success: false, message: "Payment initiation failed." });
  }
};

export const paymentCallback = async (req, res) => {
  try {
    console.log("🔹 Paytm Callback Received:", req.body);

    const paytmResponse = req.body;

    if (!paytmResponse || Object.keys(paytmResponse).length === 0) {
      console.error("❌ Paytm Callback Error: Empty request body");
      return res.status(400).json({ success: false, message: "Invalid callback request." });
    }

    // ✅ Verify Checksum using Paytm’s Official Library BEFORE modifying request body
    const receivedChecksum = paytmResponse.CHECKSUMHASH;
    const isValidChecksum = await verifyPaytmChecksum(paytmResponse, process.env.PAYTM_MERCHANT_KEY, receivedChecksum);

    if (!isValidChecksum) {
      console.error("❌ Invalid Checksum - Possible Tampering Detected!");
      return res.status(400).json({ success: false, message: "Invalid checksum" });
    }

    // ✅ Convert Paytm's ORDERID to match MongoDB's `orderId` field
    const orderId = paytmResponse.ORDERID || paytmResponse.orderId;

    // ✅ Remove Checksum AFTER Verification
    delete paytmResponse.CHECKSUMHASH;

    // ✅ Extract Payment Details from Paytm Response
    const { TXNID, TXNAMOUNT, STATUS, RESPMSG, PAYMENTMODE, TXNDATE } = paytmResponse;

    console.log(`🔹 Processing Payment: orderId=${orderId}, STATUS=${STATUS}`);

    if (!orderId || !STATUS) {
      console.error("❌ Missing orderId or STATUS in response.");
      return res.status(400).json({ success: false, message: "Invalid payment response." });
    }

    // ✅ Update Payment Status in Payment Collection
    const updatedPayment = await Payment.findOneAndUpdate(
      { orderId: orderId },  // ✅ Match MongoDB `orderId`
      {
        transactionId: TXNID,
        amount: TXNAMOUNT,
        paymentStatus: STATUS, // ✅ Use actual Paytm status
        paymentMode: PAYMENTMODE,
        transactionDate: TXNDATE,
      },
      { new: true }
    );

    if (!updatedPayment) {
      console.error(`❌ Payment not found in database for orderId: ${orderId}`);
      return res.status(404).json({ success: false, message: "Payment not found." });
    }

    // ✅ Update Lead Collection (If Payment is Related to a Lead)
    const updatedLead = await Lead.findOneAndUpdate(
      { orderId: orderId }, // ✅ Match MongoDB `orderId`
      { paymentStatus: STATUS }, // ✅ Use actual Paytm status
      { new: true }
    );

    if (!updatedLead) {
      console.warn(`⚠️ No Lead found for orderId: ${orderId}`);
    }

    console.log(`✅ Payment Status Updated: orderId ${orderId} is ${STATUS}`);

    // ✅ Send Success Response to Paytm
    return res.status(200).json({
      success: true,
      message: `Payment status updated successfully. orderId: ${orderId}, Status: ${STATUS}`,
    });
  } catch (error) {
    console.error("❌ Payment Callback Error:", error);
    return res.status(500).json({ success: false, message: "Payment callback processing failed.", error: error.message });
  }
};

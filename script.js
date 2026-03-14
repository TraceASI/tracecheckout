(function () {

  const amount = String(window.CHECKOUT_AMOUNT || "1.00");
  const currency = String(window.CHECKOUT_CURRENCY || "USD");

  let paymentCompleted = false;

  function el(id) {
    return document.getElementById(id);
  }

  function formatAmount(value) {
    return "$" + Number(value).toFixed(2);
  }

  function setAmounts() {
    document.querySelectorAll("[data-amount]").forEach((node) => {
      node.textContent = formatAmount(amount);
    });
  }

  function setMethod(label) {
    const node = el("selectedMethod");
    if (node) node.textContent = label;
  }

  function showError(message) {
    const box = el("formError");
    if (!box) return;
    box.innerHTML = message;
    box.classList.add("show");
  }

  function clearError() {
    const box = el("formError");
    if (!box) return;
    box.innerHTML = "";
    box.classList.remove("show");
  }

  function safeSet(id, value) {
    const node = el(id);
    if (node) node.textContent = value;
  }

  function createOrder(data, actions) {
    return actions.order.create({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount
          },
          description: "TraceASI Checkout - " + formatAmount(amount)
        }
      ]
    });
  }

  function getDeclineReason(details) {

    const capture = details?.purchase_units?.[0]?.payments?.captures?.[0];
    const issue =
      capture?.processor_response?.response_code ||
      capture?.status ||
      details?.status;

    console.log("Decline issue:", issue);
    console.log("Full PayPal response:", details);

    switch (issue) {

      case "INSTRUMENT_DECLINED":
        return "Your bank declined this card. Please try another card or contact your bank.";

      case "PAYER_ACTION_REQUIRED":
        return "Your bank requires additional authentication. Please try again and complete verification.";

      case "TRANSACTION_REFUSED":
        return "The transaction was refused by the bank.";

      case "CARD_EXPIRED":
        return "This card has expired. Please use another card.";

      case "INSUFFICIENT_FUNDS":
        return "This card has insufficient funds.";

      case "INVALID_ACCOUNT":
        return "The card number appears to be invalid.";

      case "DO_NOT_HONOR":
        return "Your bank declined the transaction for security reasons.";

      case "FAILED":
        return "The payment processor could not complete the transaction.";

      default:
        return "Your payment could not be completed. Please check your card details or try another payment method.";
    }
  }

  function parsePayPalError(err) {

    console.error("FULL PAYPAL ERROR:", err);

    let message = "Payment could not be processed.";

    if (err?.details && err.details.length > 0) {
      message = err.details[0].description;
    }

    else if (err?.message) {
      message = err.message;
    }

    const debug = err?.debug_id
      ? "<br><br><small>Debug ID: " + err.debug_id + "</small>"
      : "";

    return `
      <strong>Payment Failed</strong><br><br>
      ${message}<br><br>
      Possible reasons:
      <ul>
        <li>Bank declined the transaction</li>
        <li>Incorrect card details</li>
        <li>Expired card</li>
        <li>Insufficient funds</li>
        <li>Bank security verification required</li>
        <li>Card blocked for online or international payments</li>
      </ul>
      Please verify your details or try another payment method.
      ${debug}
    `;
  }

  function showConfirmation(details) {

    const capture = details?.purchase_units?.[0]?.payments?.captures?.[0];
    const paidAmount = capture?.amount?.value || amount;

    const payerName = [
      details?.payer?.name?.given_name || "",
      details?.payer?.name?.surname || ""
    ].join(" ").trim();

    const payerEmail = details?.payer?.email_address || "";

    safeSet("confirmOrderId", details?.id || "");
    safeSet("confirmAmount", formatAmount(paidAmount));
    safeSet("confirmName", payerName || "Completed");
    safeSet("confirmEmail", payerEmail || "-");

    const checkout = el("checkoutView");
    const confirm = el("confirmationView");

    if (checkout) checkout.style.display = "none";
    if (confirm) confirm.classList.add("show");

    const fx = el("fxLayer");
    if (fx) fx.classList.add("show");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderButtons() {

    paypal.Buttons({

      fundingSource: paypal.FUNDING.PAYPAL,

      style: {
        layout: "vertical",
        shape: "rect",
        label: "paypal"
      },

      onClick: function (data, actions) {
        clearError();
        setMethod("PayPal");
        return actions.resolve();
      },

      createOrder: createOrder,

      onApprove: function (data, actions) {

        return actions.order.capture()
          .then(function (details) {

            if (!details || details.status !== "COMPLETED") {

              const reason = getDeclineReason(details);
              showError(reason);

              return;
            }

            paymentCompleted = true;
            showConfirmation(details);
          })

          .catch(function (err) {
            showError(parsePayPalError(err));
          });
      },

      onError: function (err) {

        if (paymentCompleted) return;

        console.log("PayPal Debug ID:", err?.debug_id);

        showError(parsePayPalError(err));
      }

    }).render("#paypal-button-container");


    const cardButtons = paypal.Buttons({

      fundingSource: paypal.FUNDING.CARD,

      style: {
        layout: "vertical",
        shape: "rect"
      },

      onClick: function (data, actions) {
        clearError();
        setMethod("Debit / Credit Card");
        return actions.resolve();
      },

      createOrder: createOrder,

      onApprove: function (data, actions) {

        return actions.order.capture()
          .then(function (details) {

            if (!details || details.status !== "COMPLETED") {

              const reason = getDeclineReason(details);
              showError(reason);

              return;
            }

            paymentCompleted = true;
            showConfirmation(details);
          })

          .catch(function (err) {
            showError(parsePayPalError(err));
          });
      },

      onError: function (err) {

        if (paymentCompleted) return;

        console.log("Card Debug ID:", err?.debug_id);

        showError(parsePayPalError(err));
      }

    });

    if (cardButtons.isEligible()) {
      cardButtons.render("#card-button-container");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setAmounts();
    renderButtons();
  });

})();

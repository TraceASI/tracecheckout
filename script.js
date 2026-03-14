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
    box.textContent = message;
    box.classList.add("show");
  }

  function clearError() {
    const box = el("formError");
    if (!box) return;
    box.textContent = "";
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

        return actions.order.capture().then(function (details) {

          if (!details || details.status !== "COMPLETED") {
            showError("Payment not completed.");
            return;
          }

          paymentCompleted = true;
          showConfirmation(details);
        });
      },

      onError: function (err) {

        if (paymentCompleted) return;

        console.error(err);
        showError("PayPal payment could not be completed.");
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

        return actions.order.capture().then(function (details) {

          if (!details || details.status !== "COMPLETED") {
            showError("Payment not completed.");
            return;
          }

          paymentCompleted = true;
          showConfirmation(details);
        });
      },

      onError: function (err) {

        if (paymentCompleted) return;

        console.error(err);
        showError("Card payment could not be completed.");
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

(function () {
  const amount = String(window.CHECKOUT_AMOUNT || "1.00");
  const currency = String(window.CHECKOUT_CURRENCY || "USD");

  function el(id) {
    return document.getElementById(id);
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

  function formatAmount(value) {
    return "$" + Number(value).toFixed(2);
  }

  function setAmounts() {
    document.querySelectorAll("[data-amount]").forEach((node) => {
      node.textContent = formatAmount(amount);
    });
  }

  function getCountryOption() {
    const country = el("country");
    return country.options[country.selectedIndex];
  }

  function updateCountryUI() {
    const option = getCountryOption();
    const phoneCode = option.getAttribute("data-phone") || "+1";
    const postalLabel = option.getAttribute("data-postal") || "Postal code";
    const isUS = el("country").value === "US";

    el("phoneCode").value = phoneCode;
    el("postalLabel").textContent = postalLabel;

    el("stateSelectField").style.display = isUS ? "" : "none";
    el("stateTextField").style.display = isUS ? "none" : "";
  }

  function getStateValue() {
    return el("country").value === "US"
      ? el("stateSelect").value.trim()
      : el("stateText").value.trim();
  }

  function getData() {
    return {
      firstName: el("firstName").value.trim(),
      lastName: el("lastName").value.trim(),
      email: el("email").value.trim(),
      phoneCode: el("phoneCode").value.trim(),
      phoneNumber: el("phoneNumber").value.trim(),
      address1: el("address1").value.trim(),
      address2: el("address2").value.trim(),
      city: el("city").value.trim(),
      state: getStateValue(),
      postalCode: el("postalCode").value.trim(),
      country: el("country").value.trim()
    };
  }

  function validateCardForm() {
    clearError();

    const d = getData();
    const required = [
      d.firstName,
      d.lastName,
      d.email,
      d.phoneNumber,
      d.address1,
      d.city,
      d.state,
      d.postalCode,
      d.country
    ];

    if (required.some((value) => !value)) {
      showError("Please complete all required fields.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
      showError("Please enter a valid email address.");
      return false;
    }

    return true;
  }

  function showCardForm() {
    el("cardFormCard").classList.add("show");
    el("selectedMethod").textContent = "Debit / Credit Card";
    el("cardInstructions").classList.add("show");
    setTimeout(() => {
      el("cardFormCard").scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function setPaypalMethod() {
    el("selectedMethod").textContent = "PayPal";
    el("cardInstructions").classList.remove("show");
  }

  function createPaypalOrder(data, actions) {
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

  function createCardOrder(data, actions) {
    const d = getData();

    return actions.order.create({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount
          },
          description: "TraceASI Checkout - " + formatAmount(amount),
          shipping: {
            name: {
              full_name: (d.firstName + " " + d.lastName).trim()
            },
            address: {
              address_line_1: d.address1,
              address_line_2: d.address2 || undefined,
              admin_area_2: d.city,
              admin_area_1: d.state,
              postal_code: d.postalCode,
              country_code: d.country.toUpperCase()
            }
          }
        }
      ],
      payer: {
        name: {
          given_name: d.firstName,
          surname: d.lastName
        },
        email_address: d.email,
        phone: d.phoneNumber
          ? {
              phone_type: "MOBILE",
              phone_number: {
                national_number: (d.phoneCode + d.phoneNumber).replace(/\D/g, "").slice(0, 15)
              }
            }
          : undefined,
        address: {
          address_line_1: d.address1,
          address_line_2: d.address2 || undefined,
          admin_area_2: d.city,
          admin_area_1: d.state,
          postal_code: d.postalCode,
          country_code: d.country.toUpperCase()
        }
      },
      application_context: {
        shipping_preference: "SET_PROVIDED_ADDRESS"
      }
    });
  }

  function showConfirmation(details) {
    const capture = details?.purchase_units?.[0]?.payments?.captures?.[0];
    const paidAmount = capture?.amount?.value || amount;
    const payerName =
      [details?.payer?.name?.given_name || "", details?.payer?.name?.surname || ""]
        .join(" ")
        .trim() || [el("firstName").value, el("lastName").value].join(" ").trim();
    const payerEmail = details?.payer?.email_address || el("email").value || "";

    el("confirmOrderId").textContent = details?.id || "";
    el("confirmAmount").textContent = formatAmount(paidAmount);
    el("confirmName").textContent = payerName;
    el("confirmEmail").textContent = payerEmail;

    el("checkoutView").style.display = "none";
    el("confirmationView").classList.add("show");
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
        setPaypalMethod();
        clearError();
        return actions.resolve();
      },
      createOrder: createPaypalOrder,
      onApprove: function (data, actions) {
        return actions.order.capture().then(showConfirmation);
      },
      onError: function (err) {
        console.error(err);
        showError("PayPal payment could not be completed.");
      }
    }).render("#paypal-button-container");

    if (paypal.Buttons({ fundingSource: paypal.FUNDING.CARD }).isEligible()) {
      let cardFormOpened = false;

      paypal.Buttons({
        fundingSource: paypal.FUNDING.CARD,
        style: {
          layout: "vertical",
          shape: "rect"
        },
        onClick: function (data, actions) {
          if (!cardFormOpened) {
            cardFormOpened = true;
            showCardForm();
            return actions.reject();
          }

          if (!validateCardForm()) {
            return actions.reject();
          }

          clearError();
          return actions.resolve();
        },
        createOrder: createCardOrder,
        onApprove: function (data, actions) {
          return actions.order.capture().then(showConfirmation);
        },
        onError: function (err) {
          console.error(err);
          showError("Card payment could not be completed.");
        }
      }).render("#card-button-container");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setAmounts();
    updateCountryUI();
    el("country").addEventListener("change", updateCountryUI);
    renderButtons();
  });
})();

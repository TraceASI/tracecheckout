(function () {
  const amount = window.CHECKOUT_AMOUNT;
  const sdkUrl = window.PAYPAL_SDK_URL;

  function byId(id) {
    return document.getElementById(id);
  }

  function showError(message) {
    const box = byId('formError');
    if (!box) return;
    box.textContent = message;
    box.classList.add('show');
  }

  function clearError() {
    const box = byId('formError');
    if (!box) return;
    box.textContent = '';
    box.classList.remove('show');
  }

  function getData() {
    return {
      firstName: byId('firstName').value.trim(),
      lastName: byId('lastName').value.trim(),
      email: byId('email').value.trim(),
      phone: byId('phone').value.trim(),
      address1: byId('address1').value.trim(),
      address2: byId('address2').value.trim(),
      city: byId('city').value.trim(),
      state: byId('state').value.trim(),
      postalCode: byId('postalCode').value.trim(),
      country: byId('country').value.trim()
    };
  }

  function validate() {
    clearError();
    const d = getData();
    const missing = Object.entries(d)
      .filter(([key, value]) => key !== 'address2' && !value)
      .map(([key]) => key);

    if (missing.length) {
      showError('Please complete all required fields before paying.');
      return false;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email);
    if (!emailOk) {
      showError('Please enter a valid email address.');
      return false;
    }
    return true;
  }

  function loadPaypal() {
    return new Promise((resolve, reject) => {
      if (window.paypal) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = sdkUrl;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setSummary() {
    document.querySelectorAll('[data-amount]').forEach((el) => {
      el.textContent = '$' + Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    });
  }

  function showConfirmation(details) {
    const capture = details.purchase_units?.[0]?.payments?.captures?.[0] || {};
    const payer = details.payer || {};
    const payerName = [payer.name?.given_name || '', payer.name?.surname || ''].join(' ').trim();

    byId('confirmOrderId').textContent = details.id || '—';
    byId('confirmAmount').textContent = '$' + Number(capture.amount?.value || amount).toLocaleString('en-US');
    byId('confirmName').textContent = payerName || [byId('firstName').value, byId('lastName').value].join(' ').trim();
    byId('confirmEmail').textContent = payer.email_address || byId('email').value;

    byId('checkoutView').style.display = 'none';
    byId('confirmationView').classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function initButtons() {
    if (!window.paypal || !window.paypal.Buttons) {
      showError('PayPal SDK unavailable.');
      return;
    }

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        shape: 'rect',
        label: 'pay'
      },
      onClick: function (data, actions) {
        if (!validate()) {
          return actions.reject();
        }
        return actions.resolve();
      },
      createOrder: function (data, actions) {
        const d = getData();
        return actions.order.create({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: 'USD',
              value: String(amount)
            },
            description: 'TraceASI Checkout - $' + amount,
            shipping: {
              name: {
                full_name: (d.firstName + ' ' + d.lastName).trim()
              },
              address: {
                address_line_1: d.address1,
                address_line_2: d.address2 || undefined,
                admin_area_2: d.city,
                admin_area_1: d.state,
                postal_code: d.postalCode,
                country_code: d.country.toUpperCase().slice(0, 2)
              }
            }
          }],
          payer: {
            name: {
              given_name: d.firstName,
              surname: d.lastName
            },
            email_address: d.email,
            phone: d.phone ? {
              phone_type: 'MOBILE',
              phone_number: {
                national_number: d.phone.replace(/\D/g, '').slice(0, 15)
              }
            } : undefined,
            address: {
              address_line_1: d.address1,
              address_line_2: d.address2 || undefined,
              admin_area_2: d.city,
              admin_area_1: d.state,
              postal_code: d.postalCode,
              country_code: d.country.toUpperCase().slice(0, 2)
            }
          },
          application_context: {
            shipping_preference: 'SET_PROVIDED_ADDRESS'
          }
        });
      },
      onApprove: function (data, actions) {
        clearError();
        return actions.order.capture().then(function (details) {
          showConfirmation(details);
        });
      },
      onCancel: function () {
        showError('Payment was cancelled.');
      },
      onError: function (err) {
        console.error(err);
        showError('Payment could not be completed. Please try again.');
      }
    }).render('#paypal-button-container');
  }

  document.addEventListener('DOMContentLoaded', async function () {
    setSummary();
    try {
      await loadPaypal();
      initButtons();
    } catch (e) {
      console.error(e);
      showError('PayPal failed to load. Check your internet connection or client ID.');
    }
  });
})();

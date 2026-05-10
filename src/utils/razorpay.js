// Razorpay utility to dynamically load the Razorpay script
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    // Inject Mock Razorpay for dummy keys
    if (!window.MockRazorpay) {
      window.MockRazorpay = class {
        constructor(options) {
          this.options = options;
        }
        open() {
          const modal = document.createElement('div');
          modal.style.position = 'fixed';
          modal.style.top = '0';
          modal.style.left = '0';
          modal.style.width = '100vw';
          modal.style.height = '100vh';
          modal.style.backgroundColor = 'rgba(0,0,0,0.6)';
          modal.style.display = 'flex';
          modal.style.justifyContent = 'center';
          modal.style.alignItems = 'center';
          modal.style.zIndex = '9999';
          modal.style.fontFamily = 'Arial, sans-serif';
          
          const box = document.createElement('div');
          box.style.background = 'white';
          box.style.padding = '30px';
          box.style.borderRadius = '12px';
          box.style.width = '350px';
          box.style.textAlign = 'center';
          box.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
          
          const title = document.createElement('h3');
          title.innerText = 'Razorpay Test Payment';
          title.style.margin = '0 0 10px 0';
          title.style.color = '#10b981';
          
          const desc = document.createElement('p');
          desc.innerText = 'Dummy Razorpay API Integration';
          desc.style.fontSize = '12px';
          desc.style.color = '#64748b';
          desc.style.marginBottom = '20px';
          
          const amount = document.createElement('p');
          amount.innerText = `Amount: ₹${(this.options.amount / 100).toFixed(2)}`;
          amount.style.fontSize = '22px';
          amount.style.fontWeight = 'bold';
          amount.style.marginBottom = '20px';
          
          const btn = document.createElement('button');
          btn.innerText = 'Success (Pay Now)';
          btn.style.background = '#10b981';
          btn.style.color = 'white';
          btn.style.border = 'none';
          btn.style.padding = '12px 20px';
          btn.style.borderRadius = '6px';
          btn.style.cursor = 'pointer';
          btn.style.width = '100%';
          btn.style.fontWeight = 'bold';
          btn.style.marginBottom = '10px';
          
          const btnFail = document.createElement('button');
          btnFail.innerText = 'Simulate Failure';
          btnFail.style.background = '#fef2f2';
          btnFail.style.color = '#ef4444';
          btnFail.style.border = '1px solid #fca5a5';
          btnFail.style.padding = '10px 20px';
          btnFail.style.borderRadius = '6px';
          btnFail.style.cursor = 'pointer';
          btnFail.style.width = '100%';
          
          const closeBtn = document.createElement('button');
          closeBtn.innerText = 'Close window';
          closeBtn.style.background = 'transparent';
          closeBtn.style.border = 'none';
          closeBtn.style.color = '#64748b';
          closeBtn.style.padding = '5px 10px';
          closeBtn.style.marginTop = '15px';
          closeBtn.style.cursor = 'pointer';
          closeBtn.style.textDecoration = 'underline';
          
          btn.onclick = () => {
            document.body.removeChild(modal);
            this.options.handler({
              razorpay_payment_id: 'pay_dummy_' + Math.random().toString(36).substr(2, 9),
              razorpay_order_id: this.options.order_id,
              razorpay_signature: 'dummy_signature'
            });
          };
          
          btnFail.onclick = () => {
             document.body.removeChild(modal);
             if (this.options.modal && this.options.modal.ondismiss) {
                this.options.modal.ondismiss();
             }
          };

          closeBtn.onclick = () => {
             document.body.removeChild(modal);
             if (this.options.modal && this.options.modal.ondismiss) {
                this.options.modal.ondismiss();
             }
          };
          
          box.appendChild(title);
          box.appendChild(desc);
          box.appendChild(amount);
          box.appendChild(btn);
          box.appendChild(btnFail);
          box.appendChild(closeBtn);
          modal.appendChild(box);
          document.body.appendChild(modal);
        }
      }
    }

    if (document.getElementById('razorpay-sdk')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

# TODO - Link Cart to Payment with Discount

## Phase 1: Update cart.js
- [ ] Add discount state variable
- [ ] Update applyPromoCode() to validate promo codes and set discount
- [ ] Update handleCheckout() to redirect to paymentPage.html and store discount info
- [ ] Update updateCartSummary() to show real discount
- [ ] Update updateSelectedSummary() to show real discount

## Phase 2: Update paymentPage.js
- [ ] Retrieve discount info from sessionStorage
- [ ] Add discount row element reference
- [ ] Update updateOrderSummary() to show discount and calculate correct total

## Phase 3: Update paymentPage.html (if needed)
- [ ] Add discount display element in order summary section

## Phase 4: Testing
- [ ] Test checkout flow from cart to payment
- [ ] Verify discount is passed correctly


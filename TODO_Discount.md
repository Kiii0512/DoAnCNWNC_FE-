# TODO - Discount Implementation on Payment Page

## Task: Implement discount/promo code application on payment page

### Steps:
1. [x] Add `getDiscountByCode()` function in `discountApi.js`
2. [x] Implement `applyPromoCode()` function in `paymentPage.js`
3. [x] Add event listener for Apply button
4. [x] Update UI to show discount applied
5. [x] Store `discountId` in `checkoutData`
6. [x] Test the implementation

### Discount Types:
- 0 = Percentage (e.g., 10% off)
- 1 = Fixed Amount (e.g., 50000 VND off)
- 2 = Free Shipping (not applicable for payment page)

### Validation Requirements:
- Discount exists and is active
- Current date is within StartDate and ExpireDate
- UsageCount < UsageLimit
- subTotal >= MinOrderValue
- discount <= MaxDiscountAmount

---

## Implementation Summary

### Files Modified:
1. **JS/API/discountApi.js**
   - Added `getDiscountByCode(code)` function to fetch discount by code from API

2. **JS/pages/paymentPage.js**
   - Added import for `getDiscountByCode`
   - Added DOM elements for promo code input
   - Added event listeners for Apply button and Enter key
   - Implemented `applyPromoCode()` function with full validation:
     - Validate discount exists
     - Validate discount is active
     - Validate date range (StartDate <= now <= ExpireDate)
     - Validate usage limit (UsageCount < UsageLimit)
     - Validate minimum order value
     - Calculate discount based on type (percentage/fixed)
     - Apply max discount cap
   - Added `showPromoMessage()` helper function
   - Store `discountId` in `checkoutData` for order creation

### API Endpoint Required:
The backend needs to implement: `GET /api/discounts/code/{code}`


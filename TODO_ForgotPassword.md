# TODO: Forgot Password Implementation

## Step 1: Create forgotPasswordApi.js
- [x] Create JS/API/forgotPasswordApi.js with forgotPassword() and resetPassword() functions

## Step 2: Update logIn.html
- [x] Add Forgot Password form (email input)
- [x] Add OTP/Reset Password form (OTP + new password + confirm password)
- [x] Add navigation buttons between login, forgot password, and OTP forms

## Step 3: Update logIn.css
- [x] Add styles for new forms (forgot-password, otp-reset)
- [x] Add animation transitions between forms
- [x] Add styles for back buttons and navigation

## Step 4: Update logIn.js
- [x] Import forgotPasswordApi.js
- [x] Handle "Quên mật khẩu?" link click
- [x] Handle email form submission and API call
- [x] Handle OTP form submission and API call
- [x] Add form validation for email and passwords
- [x] Add navigation between forms (back to login, etc.)

## Implementation Summary
✅ Created forgotPasswordApi.js with API calls for forgot-password and reset-password endpoints
✅ Updated logIn.html with new forms:
   - Forgot Password form (email input)
   - OTP/Reset Password form (OTP + new password + confirm password)
   - Added toggle-center panel for navigation
✅ Updated logIn.css with new styles and transitions
✅ Updated logIn.js with complete forgot password flow:
   - Click "Quên mật khẩu?" → Show email input form
   - Submit email → Call API → Show OTP panel
   - Submit OTP + new password → Call API → Show success → Back to login


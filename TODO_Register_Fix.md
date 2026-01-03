# TODO: Register Fix Implementation

## Tasks:
- [x] 1. Update logIn.html - Add form ID and validation attributes
- [x] 2. Create JS/API/registerApi.js - Register API module
- [x] 3. Update JS/pages/logIn.js - Add register form handling
- [x] 4. Add CSS styles for error messages in logIn.css
- [x] 5. Test the implementation

## Password Validation Regex:
`^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$`
- At least 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

## Phone Validation:
Vietnamese phone: 10 digits starting with 0

## After Successful Register:
- User is notified of successful registration
- Form is cleared
- Navigation switches to login tab
- User can then login and update customer info on userInfoPage.html


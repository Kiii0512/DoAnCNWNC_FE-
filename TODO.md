# TODO - Search Function Implementation

## Step 1: Add searchProducts function to productApi.js
- [x] Add `searchProducts(request)` function
- [x] Transform API response to match product format

## Step 2: Update TopHeader.js
- [x] Add event listener to search button
- [x] Redirect to categoryPage with keyword param

## Step 3: Update category.js
- [x] Handle keyword param from URL
- [x] Call searchProducts API
- [x] Update ProductGrid to show results

## Step 4: Update searchPage.js
- [x] Use new searchProducts API function
- [x] Remove old mock API code

## Step 5: Fix ProductGrid.js
- [x] Import searchProducts
- [x] Call searchProducts directly when keyword present

## Step 6: Make Header and MainNav Sticky
- [x] Added `.sticky-header-wrapper` class with `display: flex; flex-direction: column` in globalStyles.css
- [x] Wrapped top-header and main-nav in homePage.html
- [x] Wrapped top-header and main-nav in categoryPage.html
- [x] Reset mainNav.css to use `top: 0`
- [x] Fixed gap issue between topbar and header

## Step 7: Testing
- [ ] Verify search button works from header
- [ ] Verify results render correctly
- [ ] Verify sticky headers work on scroll without gaps

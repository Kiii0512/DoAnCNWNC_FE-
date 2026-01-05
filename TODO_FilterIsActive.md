# TODO - Filter Categories and Brands by isActive

## Issue
Homepage and header are displaying categories and brands with `isActive: false`

## Plan
- [x] 1. Update JS/API/categoryApi.js - Add filter to only return `isActive: true` categories
- [x] 2. Update JS/API/brandApi.js - Add filter to only return `isActive: true` brands
- [x] 3. Update components/MainNav.js - Ensure it filters by `isActive` when displaying
- [x] 4. Update JS/pages/homePage.js - Ensure it filters brands by `isActive`

## Files Modified
1. `JS/API/categoryApi.js` - Added `activeOnly` parameter to `getCategories()` with `?isActive=true` query param
2. `JS/API/brandApi.js` - Added `activeOnly` parameter to `getBrands()` with `?isActive=true` query param
3. `components/MainNav.js` - Added client-side filtering for categories and brands by `isActive !== false`
4. `JS/pages/homePage.js` - Added client-side filtering for brands by `isActive !== false`


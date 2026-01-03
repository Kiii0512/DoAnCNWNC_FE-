# QuickModal Attribute Fix Plan

## Issue
The current code ignores `optionTypeId` and `optionTypeName` from the product API response and instead creates its own attribute detection logic using pattern matching, resulting in redundant/unnecessary attribute groups.

## Solution
Use the `optionTypeId` and `optionTypeName` from the API response directly, only using `getAllAttributes()` for sorting.

## Tasks - COMPLETED ✅

### 1. QuickModal.js Updates - COMPLETED ✅
- Added new `getAttributeInfo(option)` method that:
  - Uses `optionTypeId` and `optionTypeName` from API response directly
  - Falls back to pattern matching only if API data is missing
  - Returns generic fallback if both are missing

- Updated `renderAttributeOptions()` method to:
  - Use `getAttributeInfo()` for getting attribute info
  - Use `getAllAttributes()` only for sorting by `attributeId`
  - Fall back to `attributesMap` only if name is generic ('Phiên bản' or 'Thuộc tính')

- Kept `detectAttributeTypeFromValue()` and `getAttributeName()` as fallback methods for backward compatibility

### 2. How it works now:
1. For each option in variation, `getAttributeInfo(option)` is called
2. If `optionTypeId` and `optionTypeName` exist in API response, they are used directly
3. If not, pattern matching is used as fallback
4. Attribute groups are created based on `attributeId`
5. Groups are sorted by `attributeId` using the `attributesMap` from `getAllAttributes()` API

### 3. Expected Behavior:
- When API returns `optionTypeId` and `optionTypeName`: Uses them directly for grouping
- When API doesn't return them: Falls back to pattern matching from option value
- Sorting: Always follows `attributeId` order from `getAllAttributes()` API


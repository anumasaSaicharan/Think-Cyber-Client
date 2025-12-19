# Frontend Category Display Guide

## Overview
The frontend now includes comprehensive components to display categories and topics based on plan types with beautiful, plan-aware UI/UX design.

## New Components

### 1. CategoryShowcase.jsx
Located: `src/components/student/CategoryShowcase.jsx`

#### Components Included:

**CategoryCard**
- Displays individual category with design based on plan_type
- Features:
  - Color-coded badges and ribbons for each plan type
  - Plan-specific emoji icons (🎁 FREE, 📦 BUNDLE, 📚 INDIVIDUAL, ⚡ FLEXIBLE)
  - Dynamic pricing display
  - View Topics & Enroll buttons
  - Hover effects and responsive design

**CategoriesGrid**
- Responsive grid displaying all categories grouped by plan type
- Features:
  - Automatic grouping by plan_type
  - Section headers with descriptions for each plan type
  - Responsive layout (1 col mobile, 2 cols tablet, 3 cols desktop)
  - Loading state
  - Empty state handling

#### Usage Example:
```jsx
import { CategoriesGrid } from '@/components/student/CategoryShowcase';

<CategoriesGrid
  categories={categories}
  onViewDetails={handleViewDetails}
  onEnroll={handleEnroll}
  loading={loading}
/>
```

---

### 2. TopicsShowcase.jsx
Located: `src/components/student/TopicsShowcase.jsx`

#### Components Included:

**TopicsShowcase**
- Main component displaying all topics in a category
- Features:
  - Plan-type specific header with relevant info and CTAs
  - Expandable topic cards
  - Plan-aware pricing display:
    - **FREE**: "Enroll Now" button
    - **BUNDLE**: Shows bundle price and "Get Bundle" CTA
    - **INDIVIDUAL**: Shows individual topic price with "Buy Now"
    - **FLEXIBLE**: Shows both pricing options with dual CTAs
  - Topic duration and module count display
  - Summary section with benefits
  - Responsive design

#### Plan Type Headers:

| Plan Type | Header Color | Info | CTA |
|-----------|-------------|------|-----|
| FREE | Green | All topics free | Enroll Now |
| BUNDLE | Orange | Bundle price & per-topic cost | Buy Bundle |
| INDIVIDUAL | Purple | Individual pricing | Buy Topic |
| FLEXIBLE | Blue | Both options available | Buy Topic / Bundle |

#### Usage Example:
```jsx
import { TopicsShowcase } from '@/components/student/TopicsShowcase';

<TopicsShowcase
  category={category}
  topics={topics}
  onEnrollTopic={handleEnrollTopic}
  onBuyBundle={handleBuyBundle}
/>
```

---

### 3. Pages

#### BrowseCategories.jsx
Location: `src/pages/student/BrowseCategories.jsx`

Main category browsing page with:
- **Search functionality**: Search by category name or description
- **Filtering**: Filter by plan type (All, Free, Bundle, Individual, Flexible)
- **Sorting**: Sort by name, price, topics count, or recent
- **Results counter**: Shows filtered vs total categories
- **Info cards**: Benefits section at the bottom
- **Responsive design**: Mobile, tablet, desktop optimized

Features:
- Real-time search and filter updates
- Smooth transitions and animations
- Loading states
- Error handling with toast notifications
- Login redirect for non-authenticated users

#### CategoryDetails.jsx
Location: `src/pages/student/CategoryDetails.jsx`

Detailed view of a single category with:
- **Category header**: Name, description, plan type badge
- **Topics showcase**: Plan-aware topic display
- **Back button**: Navigation back to browse page
- **Call-to-action footer**: For paid categories
- **Enrollment handling**: Topic and bundle enrollment
- **Login integration**: Redirects unauthenticated users

---

## Design System

### Color Coding by Plan Type

**FREE (Green)**
- Background: `from-green-50 to-emerald-50`
- Border: `border-green-300`
- Badge: `bg-green-100 text-green-800`
- Primary: `bg-green-500`

**BUNDLE (Orange)**
- Background: `from-orange-50 to-red-50`
- Border: `border-orange-300`
- Badge: `bg-orange-100 text-orange-800`
- Primary: `bg-orange-500`

**INDIVIDUAL (Purple)**
- Background: `from-purple-50 to-pink-50`
- Border: `border-purple-300`
- Badge: `bg-purple-100 text-purple-800`
- Primary: `bg-purple-500`

**FLEXIBLE (Blue)**
- Background: `from-blue-50 to-cyan-50`
- Border: `border-blue-300`
- Badge: `bg-blue-100 text-blue-800`
- Primary: `bg-blue-500`

---

## Pricing Display Logic

### FREE
- Shows: "Completely Free"
- Button: "Enroll Now"
- Action: Direct enrollment

### INDIVIDUAL
- Shows: Topic price individually
- Button: "Buy Now" per topic
- Action: Individual topic purchase

### BUNDLE
- Shows: Total bundle price
- Calculates: Per-topic cost
- Button: "Get Bundle"
- Action: Purchase all topics at once

### FLEXIBLE
- Shows: Bundle price prominently
- Shows: Individual topic price
- Buttons: "Buy Topic" + "Get Bundle"
- Action: User choice of purchase type

---

## Integration Steps

### 1. Add Routes
Update your App.jsx or routing file:
```jsx
import BrowseCategories from './pages/student/BrowseCategories';
import CategoryDetails from './pages/student/CategoryDetails';

// In your router:
<Route path="/browse" element={<BrowseCategories />} />
<Route path="/category/:categoryId" element={<CategoryDetails />} />
```

### 2. Add Navigation Links
Update your navigation:
```jsx
<Link to="/browse">Browse Courses</Link>
```

### 3. Update API Endpoints
Ensure your backend is returning:
- `plan_type` (FREE, INDIVIDUAL, BUNDLE, FLEXIBLE)
- `bundle_price` (for BUNDLE and FLEXIBLE)
- `subscription_plan_id`
- `topicsCount` or `topics_count`

### 4. Update AppContext
Ensure AppContext provides:
- `userData` (for authentication checks)
- `currency` (for pricing display)

---

## API Integration

### Expected API Responses

**GET /api/categories**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Cybersecurity Fundamentals",
      "description": "Learn the basics...",
      "plan_type": "BUNDLE",
      "bundle_price": 999,
      "subscription_plan_id": 2,
      "topicsCount": 15,
      "status": "Active",
      "createdAt": "2024-01-15"
    }
  ]
}
```

**GET /api/categories/:id**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Cybersecurity Fundamentals",
    "description": "...",
    "plan_type": "BUNDLE",
    "bundle_price": 999,
    "subscription_plan_id": 2,
    "topicsCount": 15,
    "status": "Active"
  }
}
```

**GET /api/topics?categoryId=1**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Topic Title",
      "description": "...",
      "price": 299,
      "duration": "2 hours",
      "modules": 5
    }
  ]
}
```

---

## Customization

### Modify Colors
Edit the `getPlanTypeDesign()` function in CategoryCard or `planTypeInfo` object in BrowseCategories.

### Change Emojis
Update the emoji mappings in the design objects or `getPlanTypeEmoji()` helper.

### Adjust Spacing/Sizing
Modify Tailwind classes in the components (e.g., `gap-6`, `p-4`, etc.)

### Add More Filters
Extend the filter logic in BrowseCategories and CategoryShowcase.

---

## Testing Checklist

- [ ] Categories display with correct plan type colors
- [ ] Search filters work correctly
- [ ] Plan type filter works
- [ ] Sorting options work
- [ ] CategoryCard prices display correctly per plan type
- [ ] TopicsShowcase shows correct CTAs per plan type
- [ ] Bundle CTAs visible for BUNDLE and FLEXIBLE
- [ ] Individual topic CTAs visible for INDIVIDUAL and FLEXIBLE
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Authentication checks work (redirects to login)
- [ ] Error messages display properly
- [ ] Loading states show
- [ ] Navigation between pages works

---

## Future Enhancements

1. **Wishlist Integration**: Add to wishlist from category cards
2. **Rating & Reviews**: Show category/topic ratings
3. **Enrollment Count**: Show "X students enrolled"
4. **Tags/Categories**: Advanced filtering
5. **Recommended For You**: Personalized recommendations
6. **Live Search**: As-you-type search results
7. **Comparison View**: Compare multiple categories
8. **Video Preview**: Category preview video
9. **Certificate Info**: Show certificate details
10. **Instructor Info**: Show instructor details per category

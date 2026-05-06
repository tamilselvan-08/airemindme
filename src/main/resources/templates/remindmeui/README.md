# Numen - HTML Export

This directory contains standalone HTML versions of all pages from the **Numen** SaaS application.

## 🎯 Overview

Numen is a multi-tenant B2B SaaS application that helps businesses manage and engage their B2C customers through automated reminders, greetings, and promotions sent via WhatsApp, SMS, and Email.

## 📁 Page Structure

### Authentication Pages
- **login.html** - User login with demo credentials
- **register.html** - Business registration

### Main Application Pages  
- **home.html** - Dashboard with stats, charts, and activity
- **customers.html** - Customer management (card & list views)
- **engagement.html** - Reminders and greetings management
- **campaigns.html** - Bulk messaging campaigns
- **promotions.html** - Promotional link creator
- **settings.html** - Business and gateway settings

### Super Admin Pages
- **super-admin.html** - Admin dashboard for managing businesses
- **promo-landing.html** - Public promotional landing page

### Index
- **index.html** - Navigation hub to all pages

## 🛠 Technical Stack

- **Styling**: Tailwind CSS v3+ (via CDN)
- **Icons**: Inline SVG (Lucide-inspired)
- **Charts**: Chart.js (via CDN)
- **JavaScript**: Vanilla JS (no framework dependencies)
- **Responsive**: Mobile-first, tablet & desktop optimized

## 🎨 Design System

The HTML export preserves the original design system:

### Colors
- **Primary**: Indigo (#4F46E5)
- **Background**: Slate gray gradients
- **Text**: Slate 900/600/400 hierarchy
- **Status Colors**: 
  - Success: Emerald
  - Warning: Amber
  - Error: Red
  - Info: Blue

### Layout
- **Mobile**: Bottom navigation bar with FAB
- **Desktop**: Fixed left sidebar (256px)
- **Spacing**: Consistent gap and padding system
- **Borders**: Subtle slate-100 borders
- **Shadows**: Layered shadow system
- **Radius**: Rounded-2xl (16px) for cards

### Typography
- **Font**: System font stack (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)
- **Headings**: Bold weights (600-700)
- **Body**: Regular (400) and medium (500)

## 🚀 Usage

1. Open `index.html` in your browser to navigate all pages
2. Or directly open any specific page
3. Use demo credentials on login page:
   - **Business Admin**: admin@acmefinancial.com / password123
   - **Super Admin**: superadmin@reminderme.com / super123

## 📦 Features Preserved

✅ Fully responsive design (mobile, tablet, desktop)  
✅ Interactive charts and graphs  
✅ Form validations  
✅ Modal dialogs  
✅ Dropdown menus  
✅ Search and filters  
✅ Pagination  
✅ View toggles (card/list)  
✅ Tab navigation  
✅ Customer segmentation (VIP, Regular, New, Inactive)  
✅ Channel selection (WhatsApp, SMS, Email)  
✅ Status badges and indicators  
✅ Loading states  
✅ Error handling  

## 🔄 State Management

Each page uses vanilla JavaScript with:
- Local storage for persistence
- Event listeners for interactions
- Dynamic DOM manipulation
- Form handling and validation
- Mock data for demonstrations

## 📱 Navigation

### Mobile (< 768px)
- Bottom navigation bar
- Floating action buttons (FAB)
- Hamburger menus
- Swipe gestures (where applicable)

### Desktop (>= 768px)
- Fixed left sidebar
- Top header bar
- Dropdown menus
- Hover states

## 🎯 Key Pages Details

### Dashboard (home.html)
- Overview statistics cards
- Message activity chart (WhatsApp, SMS, Email)
- Recent messages list
- Upcoming reminders/greetings
- Quick action buttons

### Customers (customers.html)
- Search and filter customers
- Segment filters (All, VIP, Regular, New, Inactive)
- Card and list view toggle
- Add customer modal
- Bulk upload CSV
- Customer actions menu

### Engagement (engagement.html)
- Tabs for Reminders and Greetings
- Create new reminders
- Schedule greetings (Birthday, Anniversary, Festival)
- Status tracking (Scheduled, Sent, Delivered, Read, Failed)

### Campaigns (campaigns.html)
- Create bulk campaigns
- Target customer groups
- Multi-channel delivery
- Schedule campaigns
- Performance analytics

### Promotions (promotions.html)
- Select plans/products from catalog
- Create shareable links
- Target specific customer groups
- Send via WhatsApp/SMS/Email
- Track engagement

### Settings (settings.html)
- Business profile settings
- Gateway configuration (WhatsApp, SMS, Email)
- Business catalog management
- Notification preferences

### Super Admin (super-admin.html)
- Business management
- Global catalog management
- System analytics
- Onboard new businesses

### Promo Landing (promo-landing.html)
- Public-facing promotional page
- Display promoted products/plans
- Enquiry form submission
- Mobile-optimized design

## 🔐 Security Notes

These are **demonstration pages** with:
- Hardcoded mock data
- Client-side only logic
- No real authentication
- No backend integration

For production use:
1. Integrate with real backend APIs
2. Implement proper authentication
3. Add server-side validation
4. Use environment variables for configs
5. Implement CSRF protection
6. Add rate limiting

## 🌐 Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 License

This HTML export is part of the Numen project.

## 🤝 Support

For questions or issues, refer to the main project documentation.

---

**Created**: March 2026  
**Version**: 1.0.0  
**Export Date**: March 11, 2026

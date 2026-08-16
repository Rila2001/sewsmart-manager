# Garment Flow

Build a professional, modern and fully interactive static GSMS (Garment Smart Maintenance Store Management System) web application.

Core Products

The application should initially contain only these 4 products:

Movie Knife – 10 Qty

Fixing Knife – 10 Qty

Upper Looper – 10 Qty

Lower Looper – 10 Qty

Each product must have a professional relevant sewing-machine spare-part image, Product ID, quantity, stock status and assignment details.

Roles

Create only 3 roles:

Admin

Manager

Technical Lead

Admin Access

Admin should have full control over the application:

Add / Edit / Delete products

View all 4 products

Update stock

Assign products to users

Reassign / Unassign products

Manage users

Manage role permissions

View activity

View reports

Create a professional Role & Permission Management page where Admin can enable/disable permissions for Manager and Technical Lead.

Permissions can include:

View Dashboard

View Products

Add Product

Edit Product

Delete Product

Assign Product

View Stock

Update Stock

View Reports

View Activity

When Admin changes a permission, the UI must immediately reflect it for that role.

Product Assignment

Create a dedicated Assign Product UI.

Admin selects:

Product → User → Confirm Assignment

Example:

Movie Knife
→ Arun Kumar
→ Technical Lead
→ Assign

Show assigned user, role, assigned date and assigned-by information.

Allow Admin to reassign and unassign products.

Dashboard

Create a clean enterprise dashboard showing:

Total Products: 4

Total Stock: 40

Assigned Products

Unassigned Products

Low Stock

Out of Stock

Recent Activity

Dashboard values should update dynamically when stock or assignments change.

Products Page

Create a professional product grid/table.

Each product card should show:

Product image

Product name

Product ID

Quantity

Stock status

Assigned user

View Details

Assign action

Add search and filters for:

Stock Status

Assigned / Unassigned

Product Name

Stock

Allow Admin to update product quantities.

Initial stock:

Movie Knife – 10
Fixing Knife – 10
Upper Looper – 10
Lower Looper – 10

Stock status:

5 = In Stock

1–5 = Low Stock

0 = Out of Stock

Do not allow negative stock.

Login Page

Create a premium login screen with a garment factory / industrial sewing machine / maintenance spare-parts themed background related to GSMS.

Use a dark professional overlay with a clean login card.

Support demo login for:

Admin / Manager / Technical Lead.

UI/UX

Make the application look like a real enterprise inventory management product, not a basic CRUD demo.

Use:

React + TypeScript

Tailwind CSS

Lucide icons

Recharts

Framer Motion

Responsive design

Professional blue/navy color palette

Clean cards and tables

Modern typography

Toast notifications

Confirmation modals

Loading / empty / error states

Mobile responsive layout

Use mock data + React state + localStorage only. No backend or database is required.

Every major action must be interactive and functional.

The final UI should be:

Professional + Clean + Interactive + Role-based + Responsive + Enterprise-looking, while keeping the scope focused only on these 4 GSMS products.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sewsmart-manager.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/902644f3-57d9-42bd-80ba-3bf04e1b46cf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

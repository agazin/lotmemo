<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Project Instructions

This is a Next.js project with the following requirements:

- Uses Next.js 15.4.5 with JavaScript
- Material-UI (MUI) for components
- Tailwind CSS for styling
- Local storage for data persistence

## Authentication System
- Login system with 5 attempt limit
- 10-minute lockout after 5 failed attempts

## User Roles
- Admin: Full access to all features
- Superuser: Can record numbers on behalf of regular users
- User: Can only record their own numbers

## Number Recording System
- Supports 1-digit numbers (0-9)
- Supports 2-digit numbers (00-99)
- Supports 3-digit numbers (000-999)
- Users can record numbers for their customers

# Admin CMS Dashboard -- Frontend Starter Blueprint

## Project Overview

This project is a complete rework of an existing Admin CMS Dashboard
frontend.

-   Frontend: Next.js (App Router)
-   Backend: Laravel (existing API)
-   Authentication: Laravel Sanctum (cookie-based)
-   Scope: Frontend only (no backend changes)
-   Architecture Goal: Scalable, modular, reusable CRUD system
-   Pattern: Feature-based modular structure

------------------------------------------------------------------------

## Core Technical Stack

### Framework

-   Next.js (App Router)
-   TypeScript

### Styling & UI

-   TailwindCSS
-   shadcn/ui

### Data & API

-   Axios (withCredentials enabled)
-   @tanstack/react-query
-   @tanstack/react-table

### Forms & Validation

-   react-hook-form
-   zod

### Rich Text Editor

-   @tiptap/react
-   @tiptap/starter-kit

### Utilities

-   react-dropzone (image upload UI)
-   zustand (light global state if needed)
-   clsx
-   date-fns
-   sonner (toast notifications)

------------------------------------------------------------------------

## Authentication (Laravel Sanctum)

-   Cookie-based authentication
-   Must call `/sanctum/csrf-cookie` before login
-   Axios must use: withCredentials: true
-   No localStorage token usage

------------------------------------------------------------------------

## Global API Behavior

All list endpoints use Laravel default pagination format:

{ "current_page": 1, "data": \[\], "per_page": 10, "total": 100,
"last_page": 10 }

Sorting and search are fully server-side via query params:

?page=1 &per_page=10 &search=keyword &sort=column &direction=asc

------------------------------------------------------------------------

## Module Structure

All modules are CRUD-based.

Modules: - Dashboard - Abouts - Articles - Authors - Category - Brands
(logo only, no multi-language) - Testimonials - Software - Projects -
Mobile Apps - Mobile Lists - Faqs - App Setting - Company Setting

------------------------------------------------------------------------

## Multi-language System

All modules support: - English (EN) - Spanish (ES)

Except: - Brands (logo only)

Form structure example:

{ image: File, published: boolean, translations: { en: { title: string,
description: string }, es: { title: string, description: string } } }

------------------------------------------------------------------------

## Translation Flow

Button: "Make Spanish Translation"

Flow: 1. FE sends EN title + description 2. Backend translates 3.
Backend returns translated ES content 4. FE auto-fills ES fields

Requires: - Dedicated translate endpoint per module - Loading state
handling - Error handling

------------------------------------------------------------------------

## CRUD Features (Standardized)

Each module includes:

-   List page
    -   Server-side pagination
    -   Search
    -   Sorting
    -   Per-page selector
    -   Active/Published toggle
    -   Image thumbnail
    -   Checkbox (bulk-ready)
-   Create page
-   Edit page
-   Delete
-   Toggle publish/active (same field)
-   Multipart image upload directly to Laravel

------------------------------------------------------------------------

## Recommended Folder Architecture

app/ (auth)/ (dashboard)/

core/ api/ auth/ table/ form/ editor/ i18n-form/ upload/ utils/

features/ about/ articles/ authors/ category/ brands/ testimonials/
software/ projects/ mobile-apps/ mobile-lists/ faqs/ settings/

------------------------------------------------------------------------

## Required Reusable Systems

1.  Generic DataTable Engine
    -   Server pagination
    -   Sorting
    -   Search
    -   Toggle column
    -   Config-driven columns
2.  MultiLanguageForm Wrapper
    -   Language tabs
    -   Nested schema support
    -   Translation mutation handler
3.  Rich Editor Wrapper
    -   TipTap integration
    -   Image embedding support
4.  Centralized API Client
    -   Sanctum-aware
    -   CSRF bootstrap
    -   Error normalization
5.  Upload Abstraction
    -   Multipart FormData
    -   Image preview

------------------------------------------------------------------------

## Development Principles

-   No duplicated CRUD logic
-   Feature-based modularity
-   Fully server-driven data layer
-   Clean separation of concerns
-   Scalable for future module additions
-   Permission-ready architecture (future-proof)

------------------------------------------------------------------------

End of Starter Blueprint

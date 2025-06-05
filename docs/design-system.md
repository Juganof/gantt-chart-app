# SchoolGantt UI Design System

## Color Palette

### Primary Colors
- **Primary Blue**: #007bff - Main action buttons, links
- **Dark Blue**: #0056b3 - Hover states, active elements
- **Light Blue**: #e7f3ff - Light backgrounds, highlights

### Neutral Colors
- **Dark Gray**: #495057 - Primary text, headings
- **Medium Gray**: #6c757d - Secondary text, labels
- **Light Gray**: #e9ecef - Borders, dividers
- **Background**: #f8f9fa - Page background
- **White**: #ffffff - Card backgrounds, modals

### Status Colors
- **Success Green**: #28a745 - Completed tasks
- **Warning Orange**: #ffc107 - In-progress tasks
- **Danger Red**: #dc3545 - Overdue tasks
- **Info Cyan**: #17a2b8 - Information states

### Priority Colors
- **High Priority**: #fee, text: #c62 - Critical tasks
- **Medium Priority**: #ffe, text: #962 - Important tasks
- **Low Priority**: #efe, text: #262 - Regular tasks

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

### Font Sizes
- **Large Heading**: 1.5rem (24px) - Page titles
- **Medium Heading**: 1.25rem (20px) - Section headers
- **Small Heading**: 1rem (16px) - Card titles
- **Body Text**: 0.875rem (14px) - Regular content
- **Small Text**: 0.75rem (12px) - Labels, metadata

### Font Weights
- **Bold**: 600 - Headings, important text
- **Medium**: 500 - Labels, buttons
- **Regular**: 400 - Body text

## Spacing System

### Base Unit: 0.25rem (4px)

- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **xxl**: 3rem (48px)

## Component Guidelines

### Buttons
- **Primary**: Blue background, white text, 8px padding, 4px border-radius
- **Secondary**: Gray background, white text
- **Outline**: Transparent background, colored border

### Cards
- **Background**: White
- **Border**: 1px solid #e9ecef
- **Border Radius**: 8px
- **Shadow**: 0 2px 4px rgba(0,0,0,0.1)
- **Padding**: 1.5rem

### Form Elements
- **Input Fields**: White background, gray border, 6px border-radius
- **Focus State**: Blue border, subtle shadow
- **Padding**: 0.5rem

### Timeline Elements
- **Task Bars**: Rounded rectangles with status colors
- **Dependencies**: Curved arrows connecting tasks
- **Grid Lines**: Light gray, subtle
- **Time Labels**: Small gray text

## Layout Principles

### Grid System
- **Container**: Max-width with centered content
- **Gutters**: 1rem spacing between elements
- **Responsive**: Mobile-first approach

### Visual Hierarchy
1. **Primary Actions**: Prominent blue buttons
2. **Secondary Actions**: Subtle gray buttons
3. **Content**: Clear text hierarchy
4. **Supporting Elements**: Muted colors and smaller text

### Interaction States
- **Hover**: Subtle color changes, slight elevation
- **Active**: Pressed state with darker colors
- **Focus**: Outline for accessibility
- **Disabled**: Reduced opacity, no interaction

## Accessibility Guidelines

### Color Contrast
- **Text on Background**: Minimum 4.5:1 ratio
- **Large Text**: Minimum 3:1 ratio
- **Interactive Elements**: Clear visual distinction

### Interactive Elements
- **Focus Indicators**: Visible outline for keyboard navigation
- **Touch Targets**: Minimum 44px for mobile
- **Alt Text**: Descriptive text for images

### Motion
- **Subtle Animations**: 200-300ms duration
- **Respect Preferences**: Honor reduced motion settings
- **Purposeful**: Animations should enhance UX, not distract

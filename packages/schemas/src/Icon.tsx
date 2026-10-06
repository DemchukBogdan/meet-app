// src/components/ui/Icon/Icon.tsx

// keep this component in the shared UI directory so other components can render
// icons through one consistent interface for their names, sizes, colors, and strokes.

// import the package's runtime exports as a namespace to look up an icon
// dynamically using the name supplied by the caller instead of selecting a specific
// icon import here. This namespace also includes exports that are not icon components.
import * as LucideIcons from 'lucide-react';
// Import tailwind-variants for managing our component class states and responsive variants

// import tv to define reusable Tailwind classes and their supported variants.
// VariantProps is a type-only import that derives the component's variant properties
// from that definition, keeping the TypeScript interface aligned with the variants.
import { tv, type VariantProps } from 'tailwind-variants';

//export the variant function so the component—and other code that needs the same
// styling rules—can generate a class string from the available size and color options.
// We export the variants so they can be reused if necessary in other parts of the app
// Base styles ensure the icon doesn't shrink and transitions smoothly on state changes
// Custom dimensions are a size variant with no utilities. Selecting it skips the
// preset `size-*` classes (including the default) while keeping variant resolution
// inside tailwind-variants, so `className` is still merged last.
export const iconVariants = tv({
  // Apply these classes regardless of the selected variants. shrink-0 prevents
  // flexbox from reducing the icon's size, while transition-colors enables CSS
  // transitions for supported color properties when their values change.
  base: 'shrink-0 transition-colors',

  // Group the independent styling options accepted by the generated function.
  // Each selected option contributes its classes to the resulting class string.
  variants: {
    // Size variants map to specific pixel values in our design system
    // Each size utility sets both width and height. The pixel equivalents assume
    // the standard Tailwind spacing scale and a root font size of 16px.
    size: {
      // Set both dimensions to 0.875rem for the extra-small size.
      xs: 'size-3.5', // 14px

      // Set both dimensions to 1rem for the small size.
      sm: 'size-4', // 16px

      // Set both dimensions to 1.25rem for the medium size.
      md: 'size-5', // 20px

      // Set both dimensions to 1.5rem for the large size.
      lg: 'size-6', // 24px

      // Set both dimensions to 2rem for the extra-large size.
      xl: 'size-8', // 32px

      // No width or height utilities. A numeric custom size is applied as SVG
      // attributes; a Tailwind size class would override those attributes.
      custom: '',
    },
    // Color variants map to our semantic color palette using standard Tailwind classes
    // These utilities set the CSS color property. Lucide's default SVG stroke
    // uses currentColor, allowing the rendered strokes to follow that property.
    color: {
      // Select the blue-600 palette token for the primary appearance.
      primary: 'text-blue-600',

      // Select the red-600 palette token for the error appearance.
      error: 'text-red-600',

      // Select the green-600 palette token for the success appearance.
      success: 'text-green-600',

      // Select the gray-400 palette token for the muted appearance.
      muted: 'text-gray-400',

      // Use currentColor so the icon follows the inherited text color.
      current: 'text-current',
    },
  },
  // Default variants ensure the component always has a baseline appearance if no props are passed
  // These defaults apply to omitted or undefined variant properties; the component
  // itself still requires a name prop to identify the export to render.
  defaultVariants: {
    // Use the small dimensions when no size variant is supplied.
    size: 'sm',

    // Follow the surrounding text color when no color variant is supplied.
    color: 'current',
  },
});

// Extracting the IconName type directly from Lucide exports for strict typing on the name prop
// keyof produces a union of the namespace's export names. This checks that a name
// exists in the namespace type, but does not restrict that name to icon components;
// other exported values may also be included.
export type IconName = keyof typeof LucideIcons;

// Main component interface extending the tailwind-variants props for seamless integration
// Inherit the size and color properties from the variant definition so changes
// to the available variant keys are reflected automatically in the props type.
export interface IconProps extends VariantProps<typeof iconVariants> {
  // The exact name of the icon from lucide-react
  // Require this property because it determines which namespace member is selected.
  name: IconName;
  // Optional additional classes for layout purposes (like margins or positioning)
  // Pass these classes through iconVariants alongside the selected variants.
  // They can also provide other styling utilities, including width and height.
  className?: string;
  // The numeric property is passed directly to Lucide as its strokeWidth prop.
  strokeWidth?: number;
  // Pixel size for the SVG. When set, it replaces the `size` variant classes.
  customSize?: number;
}

// Main functional component using arrow syntax
// Destructure the supported properties from the props object. Leave omitted size
// and color values undefined so the variant function can apply its defaults.
// Default strokeWidth to 2 when the supplied value is undefined or omitted.
export const Icon = ({
  name,
  size,
  color,
  className,
  strokeWidth = 2,
  customSize,
}: IconProps) => {
  // Lucide types their exports as LucideIcon to ensure we render a valid React element
  // Individual icon exports have the LucideIcon type, but the namespace also has
  // other exports. The assertion below tells TypeScript to treat the selected value
  // as an icon; it does not validate or convert that value at runtime.
  // The capitalized variable name allows JSX to treat it as a component reference.
  const IconComponent = LucideIcons[name] as LucideIcons.LucideIcon;

  // Preset sizes stay on Tailwind. A numeric size must not emit `size-*`: those
  // utilities override the SVG width and height attributes Lucide sets from `size`.
  const resolvedSize = customSize === undefined ? size : 'custom';

  // Return the selected component directly without adding a surrounding DOM element.
  return (
    <IconComponent
      // combine the base classes, selected or default size and color variants,
      // and caller-provided classes into the className passed to the icon.
      // Conflicting utility classes are resolved by tailwind-variants.
      className={iconVariants({ size: resolvedSize, color, className })}
      // Sets the SVG width and height attributes. Undefined keeps Lucide's own
      // default; a number is the only size source once the `size-*` class is gone.
      size={customSize}
      // pass the caller's stroke width, or the default value of 2, to Lucide
      // so the rendered SVG uses that value for its stroke width.
      // The apparent stroke thickness also depends on the SVG's rendered scale.
      strokeWidth={strokeWidth}
    />
  );
};

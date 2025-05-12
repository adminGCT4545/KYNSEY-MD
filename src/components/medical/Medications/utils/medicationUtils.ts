/**
 * Type definition for medication status values
 */
export type MedicationStatus = 'active' | 'discontinued' | 'completed';

/**
 * Returns Tailwind CSS classes for styling medication status badges
 * @param status - The current status of the medication
 * @returns A string of Tailwind CSS classes for text and background colors
 * 
 * @example
 * ```tsx
 * const statusClasses = getStatusColor('active');
 * // Returns 'bg-green-100 text-green-800'
 * ```
 */
export const getStatusColor = (status: MedicationStatus): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'discontinued':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};
# Google Sheets Column Structure for Event Bookings

This document outlines the exact column structure for each event segment to ensure data alignment and prevent columns from shifting.

## Common Columns (All Event Segments)
**Columns 1-11** are the same for all events:

1. **Booking Date/Time** - When the booking was made
2. **Event Title** - Name of the event
3. **Event Date** - When the event takes place
4. **Guardian Name** - Parent/guardian's full name
5. **Child Name** - Child's full name
6. **Email** - Guardian's email address
7. **Phone** - Guardian's phone number
8. **Number of Tickets** - How many tickets purchased
9. **Transaction ID** - Stripe payment ID
10. **Payment Status** - Always "Paid" for successful bookings
11. **Timestamp** - ISO timestamp of the booking

## Event-Specific Columns

### Cinema Morning Events
**Additional Columns 12-17:**
12. **Emergency Contact Name**
13. **Emergency Contact Phone**
14. **Child Date of Birth**
15. **Child Age**
16. **Allergies** (comma-separated if multiple)
17. **Additional Notes**

**Total Columns: 17**

### Mama Breakfast Events
**Additional Columns 12-20:**
12. **Emergency Contact Name**
13. **Emergency Contact Phone**
14. **Child Date of Birth**
15. **Child Age**
16. **Allergies** (comma-separated if multiple)
17. **Additional Notes**
18. **Choice I - Bread Selection**
19. **Choice II - Main Course**
20. **Choice III - Protein Selection**

**Total Columns: 20**

### MamaFit Events
**Additional Columns 12-15:**
12. **Pregnant Status** (Yes/No)
13. **Postpartum Status** (Yes/No)
14. **Medical Conditions** (Yes/No)
15. **Additional Notes**

**Total Columns: 15**

### Eklektik Edit Events
**Additional Columns 12:**
12. **Additional Notes**

**Total Columns: 12**

### Hello Chef Events
**Additional Columns 12-19:**
12. **Emergency Contact Name**
13. **Emergency Contact Phone**
14. **Child Date of Birth**
15. **Child Age**
16. **Cooking Experience Level**
17. **Food Allergies/Restrictions**
18. **Favorite Foods**
19. **Additional Notes**

**Total Columns: 19**

## Important Notes

1. **Empty Fields**: All fields are included even if empty, ensuring column alignment
2. **Column Order**: The order is fixed and should not be changed
3. **Data Types**: 
   - Text fields: Empty string if no value
   - Checkbox groups: Comma-separated values or empty string
   - Required fields: Will always have values
   - Optional fields: May be empty strings

## Setting Up Your Google Sheets

1. **Create headers** in row 1 for each column
2. **Freeze row 1** to keep headers visible
3. **Set column widths** appropriately for each data type
4. **Use data validation** for fields with specific options (e.g., Yes/No fields)

## Example Headers Row

```
A: Booking Date/Time | B: Event Title | C: Event Date | D: Guardian Name | E: Child Name | F: Email | G: Phone | H: Tickets | I: Transaction ID | J: Payment Status | K: Timestamp | L: [Event-specific fields...]
```

## Troubleshooting

- **Columns shifting**: Ensure all fields are included in the correct order
- **Missing data**: Check that empty fields are filled with empty strings, not skipped
- **Wrong columns**: Verify the event segment is correctly identified

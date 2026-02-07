Quotation & Billing System – Change 
Requirements Document 
1. Purpose 
This document describes all required changes, issues, and enhancements for the Quotation & 
Billing module. It is intended to be shared with the developer so they can save, understand, 
and implement the changes accurately. 
2. Quotation – Customer Handling 
2.1 Editable Customer Name 
● Currently, when adding a customer in Quotation, a default name (or placeholder text) 
appears which is non-editable. 
● Required Change: 
○ Customer name must be fully editable. 
○ User should be able to type any name directly. 
2.2 Customer Category 
● Add Customer Category using checkboxes: 
○ Regular Customer 
○ Walking Customer 
2.3 Customer Creation Logic 
● While creating a Quotation or Bill, user should NOT be forced to pre-create a customer. 
● Behavior should be: 
○ Customer field is editable. 
○ User can: 
■ Enter customer name manually 
■ OR select from dropdown (existing customers) 
● If Regular Customer is selected: 
○ Customer data should be saved in Regular Customers list. 
● If Walking Customer is selected: 
○ Customer data should be saved only in Walking Customers category. 
2.4 Customer Details 
● Customer details must be editable from the customer list, especially for Walking 
Customers: 
○ Mobile Number 
○ Address 
3. Items & Rate Calculation Logic 
3.1 Item Structure (Current Issue) 
● Currently item name, category (e.g. DC 26F), color, and other details are shown 
combined in one field. 
● This should NOT happen. 
3.2 Required Item Logic 
● Item rate must be decided based on combination of the following: 
○ Item Name (e.g. DC 26F) 
○ Item Color (e.g. White, Black, Champagne, Silver) 
○ Item Thickness / Gauge 
● Based on these three parameters: 
○ Correct rate should be fetched 
○ Backend data should update accordingly 
○ Frontend should reflect updated data 
3.3 Editable Fields 
● Item Name 
● Color 
● Thickness / Gauge 
● Brand (see section 7) 
4. Length Handling 
● Current issue: 
○ Length is not using floating-point values. 
○ Example: 4.5 feet is not supported (only 4 or 5). 
● Required Change: 
○ Length must support floating-point values (e.g. 4.5, 3.75). 
5. Amount Field Removal 
● In both Quotation and Bill: 
○ Amount column / row is unnecessary. 
● Required Change: 
○ Remove the complete Amount row/column from items table. 
6. Keyboard & UX Behavior 
6.1 Enter vs Tab Navigation 
● Replace Tab key behavior with Enter key. 
● Pressing Enter should move to the next cell. 
6.2 New Item Creation 
● When user presses Enter on the last cell of an item row: 
○ A new item row should be created automatically. 
6.3 Delete Button Focus Issue 
● While navigating using Enter or Tab, focus should NOT move to: 
○ Item Delete icon/button 
● Delete action should only be performed: 
○ By manual mouse click 
○ With confirmation popup 
6.4 Delete Confirmation 
● On clicking delete: 
○ Show warning popup: 
■ "Are you sure you want to delete this item?" 
○ Action proceeds only after user confirms. 
7. Popup Issue on Page Load 
● Issue: 
○ A popup appears automatically when user lands on the page. 
○ Popup appears repeatedly and disturbs workflow. 
● Required Action: 
○ Discuss with developer (Azib) 
○ Identify cause 
○ Resolve unnecessary popup behavior 
8. Bill Calculation Issues 
8.1 Incorrect Calculations 
● Total bill and sum calculations at the bottom are incorrect. 
● There are logic mistakes in calculation. 
● Required Change: 
○ Fix calculation logic 
○ Ensure totals are accurate 
8.2 Bottom UI Redesign 
● Bottom section UI must be updated (top section remains unchanged). 
● Show following fields in horizontal layout: 
○ Total Bill 
○ Received Amount 
○ Pending Amount 
○ Ledger Update Status 
○ Total Calculated Cost 
9. Ledger Issue 
● Ledger is not being added/updated while creating quotation or bill. 
● Required Change: 
○ Fix ledger add/update issue 
10. Brand Handling (New Requirement) 
10.1 Brand Field at Top 
● Add a Brand Name dropdown at the top of Quotation & Bill: 
○ Examples: 
■ Haq Interior 
■ Haq Aluminium 
■ Seven Star 
10.2 Brand Selection Logic 
● Usually one brand is used for a full order. 
● User should be able to: 
○ Select brand at the top initially 
○ Change brand later if required 
10.3 Item-Level Brand Override 
● Each item row should also have editable brand field. 
● This allows mixing brands when one brand’s item is unavailable. 
11. Scope Status 
● These are the currently identified issues. 
● After fixing these: 
○ Around 90% of the project is expected to be complete. 
● Remaining issues will be discussed later. 
12. Notes for Developer 
● Please save this document 
● Implement changes strictly as per this specification 
● Any ambiguity should be discussed before implementation
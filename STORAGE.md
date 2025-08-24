# Secret Santa App - Data Storage Documentation

## 📁 How Data Storage Works

### Current Storage Method: localStorage (Browser Storage)

The application currently uses **localStorage** to persist secret santa assignments:

- **Storage Location**: Your browser's localStorage
- **Storage Key**: `'secretSantaState'`
- **Data Format**: JSON object containing the AppState

### What Gets Stored

```typescript
{
  familyMembers: string[];           // All family members
  availableReceivers: string[];      // People who can still be assigned
  assignments: Record<string, string>; // Who has whom: giver -> receiver
  completedAssignments: SantaAssignment[]; // Array of all assignments
}
```

### Storage Persistence

✅ **Data WILL persist when:**
- Closing and reopening the browser tab
- Closing and reopening the browser entirely
- Computer restarts
- Navigating to different pages within the app

❌ **Data WILL be lost when:**
- Clearing browser data/cookies
- Using incognito/private browsing mode
- Using a different browser
- Using a different computer/device
- Manually clicking "Reset All Assignments"

### Files That Handle Storage

- **Save**: `/app/assign_santas/page.tsx` - Line ~38-40 (useEffect saves to localStorage)
- **Load**: Both pages load from localStorage on mount
- **Clear**: Reset button in admin controls

### Upgrading to Persistent Database

For true persistence across devices/browsers, you would need:

1. **Firebase/Firestore** (easiest)
2. **Supabase** (PostgreSQL-based)
3. **Custom backend** with database
4. **Vercel KV** or similar cloud storage

### Family Member Configuration

- **File**: `/app/features/santa/constants.ts`
- **Current Members**: Rosa, Alan, Nhic, Camila, Chris, Carrie
- **To Add/Remove**: Edit the `FAMILY_MEMBERS` array in constants.ts

### Privacy Features Implemented

1. **No Spoilers**: Available people list is hidden to prevent spoilers
2. **Name Validation**: Only exact family member names are accepted
3. **Name Reference**: Family list is shown for exact spelling
4. **Status Tracking**: Shows who has completed assignments (names only, not receivers)

## 🔧 Technical Implementation

The data flow is:
1. User enters assignment → State updated → Saved to localStorage
2. Page refresh → Load from localStorage → Restore state
3. Admin reset → Clear localStorage → Reset to initial state

This ensures a smooth experience while maintaining privacy and preventing accidental spoilers!

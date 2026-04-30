# Security Specification

## Data Invariants
1. Users: Only the authenticated user or an Admin can modify their own document. "role" field cannot be set to "admin" by users themselves.
2. Cars: A car can only be created by an authenticated user matching the `sellerId`. Only the seller or an Admin can update it. `sellerId` is immutable.
3. Chat/Messages: Only participants or Admin can read/write.
4. Admins: Only readable by Admins. Not writable by anyone from the client.

## The "Dirty Dozen" Payloads
1. `Shadow Update User`: Send payload to user profile including `isAdmin: true` or changing `role` to `admin`.
2. `Spoof Attack User`: Create UserProfile with another user's UID.
3. `Denial of Wallet Car`: Create a car with a 50KB string in `make` or an array of 1000 images.
4. `Orphaned Car`: Create a car where `sellerId` does not exist or does not match `request.auth.uid`.
5. `Identity Spoofing Car`: Update `sellerId` to steal ownership of a car.
6. `State Shortcutting Car`: Update a car status without the required schema validations or bypassing keys.
7. `Message Snooping`: Read a `/chats/{chatId}/messages` where the user is not `userId`.
8. `Master Key Injection`: Attempt to create an admin document using client SDK.

## The Test Runner
See `firestore.rules.test.ts`.

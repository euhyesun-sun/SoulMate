# Security Specification - SoulMate

## 1. Data Invariants
- A `Session` must have a `userId` matching the authenticated user.
- `Messages` can only be created/read if the parent `Session` belongs to the authenticated user.
- `User` profiles can only be managed by the owner.
- `createdAt` and `userId` are immutable once set.
- Timestamps must correspond to `request.time`.

## 2. The "Dirty Dozen" Payloads (Denial Scenarios)

1. **Identity Spoofing**: Attempt to create a `Session` for someone else.
   - Payload: `{ userId: "victim_id", mood: "tired", status: "active", ... }`
   - Goal: `PERMISSION_DENIED`.
2. **Session Hijacking**: Attempt to read someone else's session.
   - Goal: `PERMISSION_DENIED`.
3. **Ghost Messages**: Attempt to inject messages into a session owned by another user.
   - Goal: `PERMISSION_DENIED`.
4. **Id Poisoning**: Use a 2KB string as a session ID.
   - Goal: `PERMISSION_DENIED`.
5. **State Shortcut**: Attempt to change another user's session status.
   - Goal: `PERMISSION_DENIED`.
6. **Shadow Update**: Attempt to add `isAdmin: true` to a user profile.
   - Goal: `PERMISSION_DENIED` via `affectedKeys().hasOnly()`.
7. **Timestamp Fraud**: Send a fake `createdAt` from the past.
   - Goal: `PERMISSION_DENIED`.
8. **PII Leak**: Non-owner attempts to read a user profile.
   - Goal: `PERMISSION_DENIED`.
9. **Resource Exhaustion**: Send a 1MB string as a message.
   - Goal: `PERMISSION_DENIED` via `.size() <= 4096`.
10. **Immutable Violation**: Attempt to change `userId` of a session.
    - Goal: `PERMISSION_DENIED`.
11. **Orfan Messaging**: Send a message to a non-existent session ID.
    - Goal: `PERMISSION_DENIED` via `existsAfter`.
12. **Self-Promotion**: User attempts to update their own `createdAt` date.
    - Goal: `PERMISSION_DENIED`.

## 3. Test Runner Plan
I will use the rules logic to prevent these.

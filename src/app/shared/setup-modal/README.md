# Setup Modal Component

A modal component that prompts users to complete their first-time setup when they haven't activated their account.

## Features

- **Visual Setup Prompt**: Shows a prominent modal instead of a small navbar button
- **User-Friendly Design**: Clear explanation of what setup involves
- **Responsive**: Works on both desktop and mobile devices
- **Accessible**: Proper ARIA labels and keyboard navigation

## Usage

```html
<app-setup-modal 
    [isOpen]="isSetupModalOpen" 
    [userName]="user?.display_name || user?.login || 'User'"
    (close)="onSetupModalClose()"
    (startSetup)="onSetupModalStart()">
</app-setup-modal>
```

## Inputs

- `isOpen`: Boolean to control modal visibility
- `userName`: String to display the user's name in the modal

## Outputs

- `close`: Emitted when user closes the modal
- `startSetup`: Emitted when user clicks "Start Setup" button

## Integration

The modal is automatically shown by the `UserStateService` when a user is not active. It integrates with the existing Twitch OAuth flow.

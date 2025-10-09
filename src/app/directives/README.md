# Block Inactive User Directive

A directive that prevents inactive users from performing actions that require HTTP requests.

## Features

- **Action Blocking**: Prevents clicks and form submissions for inactive users
- **Visual Feedback**: Adds disabled styling and tooltips
- **Modal Trigger**: Shows setup modal when blocked actions are attempted
- **Configurable**: Can target specific action types (click, submit, or all)

## Usage

### Basic Usage
```html
<button appBlockInactiveUser (click)="saveData()">Save</button>
```

### With Action Type
```html
<button appBlockInactiveUser actionType="click" (click)="saveData()">Save</button>
<form appBlockInactiveUser actionType="submit" (ngSubmit)="submitForm()">
  <input type="submit" value="Submit">
</form>
```

## Inputs

- `actionType`: 'click' | 'submit' | 'all' (default: 'all')
  - `click`: Only blocks click events
  - `submit`: Only blocks form submission events
  - `all`: Blocks both click and submit events

## Behavior

When a user is inactive:
1. The directive prevents the action (calls `preventDefault()` and `stopPropagation()`)
2. Visual styling is applied (opacity, cursor, disabled state)
3. A tooltip is shown explaining the requirement
4. The setup modal is triggered to guide the user

## Integration

The directive automatically subscribes to `UserStateService.isUserActive$` to determine user status and updates the UI accordingly.

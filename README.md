# React Resizable Hook

A lightweight (1.3kB gzipped!), hooks-based, easy-to-use alternative to [react-resizable](https://www.npmjs.com/package/react-resizable).

Check out the **[demo](https://mikkelwestermann.github.io/react-use-resizable/)**

## Installation

```
npm i react-use-resizable
```

## How to use

The hook returns an object with the following properties:
- `rootRef`: A ref to the root element of the resizable component
- `getRootProps`: A function that returns the props to be spread on the root element
- `getHandleProps`: A function that returns the props to be spread on the handle element


The hooks behavior can be customized by passing an options object to the hook. The options object can have the following properties:
| Property | Type | Description | Optional | Default |
| --- | --- | --- | --- | --- |
| `maxHeight` | `number` | The maximum height of the component | Yes | `Infinity` |
| `maxWidth` | `number` | The maximum width of the component | Yes | `Infinity` |
| `minHeight` | `number` | The minimum height of the component | Yes | `0` |
| `minWidth` | `number` | The minimum width of the component | Yes | `0` |
| `lockHorizontal` | `boolean` | Whether the component should be horizontally resizable | Yes | `false` |
| `lockVertical` | `boolean` | Whether the component should be vertically resizable | Yes | `false` |
| `onResize` | `function` | A callback function that is called when the component is resized | Yes | `() => {}` |
| `onDragEnd` | `function` | A callback function that is called when the component is done resizing | Yes | `() => {}` |
| `onDragStart` | `function` | A callback function that is called when the component starts resizing | Yes | `() => {}` |
| `disabled` | `boolean` | Whether the component should be resizable | Yes | `false` |
| `interval` | `number` | The interval at which the resize will occur (i.e. which sizes the component will snap to) | Yes | `1` |
| `initialHeight` | `number` | The initial height of the component | Yes | `100` |
| `initialWidth` | `number` | The initial width of the component | Yes | `100` |
| `maintainAspectRatio` | `boolean` | Whether the component should maintain its aspect ratio (ratio between `initialHeight` and `initialWidth`) when resizing | Yes | `false` |

Most of these properties can be overridden for each handle by passing passing an options object to the `getHandleProps` function. The options object can have the following properties:
| Property | Type | Description | Optional | Default |
| --- | --- | --- | --- | --- |
| `maxHeight` | `number` | The maximum height of the component | Yes | `Infinity` |
| `maxWidth` | `number` | The maximum width of the component | Yes | `Infinity` |
| `minHeight` | `number` | The minimum height of the component | Yes | `0` |
| `minWidth` | `number` | The minimum width of the component | Yes | `0` |
| `lockHorizontal` | `boolean` | Whether the component should be horizontally resizable | Yes | `false` |
| `lockVertical` | `boolean` | Whether the component should be vertically resizable | Yes | `false` |
| `onResize` | `function` | A callback function that is called when the component is resized | Yes | `() => {}` |
| `onDragEnd` | `function` | A callback function that is called when the component is done resizing | Yes | `() => {}` |
| `onDragStart` | `function` | A callback function that is called when the component starts resizing | Yes | `() => {}` |
| `disabled` | `boolean` | Whether the component should be resizable | Yes | `false` |
| `interval` | `number` | The interval at which the resize will occur (i.e. which sizes the component will snap to) | Yes | `1` |
| `maintainAspectRatio` | `boolean` | Whether the component should maintain its aspect ratio (ratio between `initialHeight` and `initialWidth`) when resizing | Yes | `false` |
| `parent` | `RefObject<HTMLElement>` | A ref to the parent element of the handle | Yes | `null` |
| `reverse` | `boolean` | Whether the handle should be reversed | Yes | `false` |

Passing the same property to both the hook and the `getHandleProps` function will override the hook's property with the `getHandleProps` property.

The `onResize`, `onDragEnd` and `onDragStart` functions will be invoked with an object containing the following properties:
| Property | Type | Description |
| --- | --- | --- |
`newHeight` | `number` | The new height of the component |
`heightDiff` | `number` | The difference in height between the previous and the new height |
`newWidth` | `number` | The new width of the component |
`widthDiff` | `number` | The difference in width between the previous and the new width |


## Example

A simple example of how to use the hook:

```jsx
import React from 'react';
import { useResizable } from 'react-use-resizable';

const FreeMoving = () => {
  const { getRootProps, getHandleProps } = useResizable({
    initialWidth: 150,
    initialHeight: 150
  });

  return (
    <div>
      <div
        className="bg-blue-500 relative rounded flex justify-center items-center"
        {...getRootProps()}
      >
        <div className="text-white text-center">Free moving</div>

        <div
          className="bg-blue-700 absolute bottom-0 right-0 p-2 rounded-tl-lg rounded-br text-white"
          {...getHandleProps()}
        >
          Handle
        </div>
      </div>
    </div>
  );
};
```

Many more examples can be found in the [demo](https://mikkelwestermann.github.io/react-use-resizable/).

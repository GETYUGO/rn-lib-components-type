# rn-lib-components-type
Typescript definitions for React components

## Installation
```bash
npm i @enchiladas/react-components
```
```bash
yarn add @enchiladas/react-components
```

## Description
Give typescript definitions for the React components more flexible than the original one.
## Why to use this package
If you are using React and typescirpt you probably had some trouble with component props and default props.
With the original type, each of your optional props should always be undefined but it's false when you give there a default value.

With the original component type given by react, you can't specify what type of children you need on your component.
This can make some bugs due to a bad usage of a component children.

With the `CustomFunctionComponent` type, all of that can be explicitly specified.
# How to use it
Instead of using types `React.FC<PropsType>` or `React.VFC<PropsType>` use a `CustomFuctionComponent<PropsType>` to define the type of you component

## Example
```typescript
// MyComponent.tsx

import { 
  CustomFunctionComponent,
  Internal,
  External,
  ChildrenType,
} from '@enchiladas/react-components';

interface MyComponentProps {
  myRequiredProps: any;
  myOptionalProps?: any;
  myOptionalPropsWithDefaultValue?: any;
}

interface MyComponentRef {
  something: any;
}

const defaultProps = {
  myOptionalPropsWithDefaultValue = 'default';
}

type MyComponentType = CustomFunctionComponent<
  MyComponentProps,
  keyof typeof defaultProps,
  MyComponentRef,
  ChildrenType.ALL
>;

const MyComponent: Internal<MyComponentType> = React.forwardRef((props, ref) => {
  props.myRequiredProps; // Of type any
  props.myOptionalProps; // Of type any | undefined
  props.myOptionalPropsWithDefualtValue; // Of type any

  return (
    <div>
      Hello world!
    </div>
  );
});

export default MyComponent as External<MyComponentProps>
```
```HTML
<!-- Usage example -->
<div>
  <MyComponent
    ref={MyComponentRef}
    myRequiredProps="hello"
  />
  <MyComponent
    ref={MyComponentRef}
    myRequiredProps="world"
    myOptionalProps="Foo"
    myOptionalPropsWithDefaultValue="Bar"
  />
</div>
```
## Definition
`CustomFunctionComponent` Accept 1 to 4 template arguments

`PropsType`: Interface representing all of the component props. (required)

`DefaultKeys`: String type representing all the props with a default value. (default: `undefined`)

`Ref`: Interface representing the reference object accessible on the component. (default: `undefined`)

`ChildrenType`: Value of `ChildrenType` representing the type of children given to the component. (default: `ChildrenType.NONE`)
## Internal VS External
The component must define two type to be interpreted correctly by the Typescript engine.

The internal version of the type obtained using `Internal<CustomFunctionComponent<MyPropsType, ...>>` put the optional props with default value as required. This must be use to type the component when it declared.

The external version of the type obtained using `External<CustomFunctionComponent<MyPropsType, ...>>` let the Props interface as the same as you defined it. This type must be use to type the component when it export from his module.

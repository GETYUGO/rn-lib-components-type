import { ValidationMap } from 'prop-types';
import { ReactElement, WeakValidationMap } from 'react';

type DefaultChildrenType = ChildrenType.NONE;

/**
 * Get a string type of all the optional keys of an interface
 * @template T Any interface
 */
export type OptionalPropertyOf<T> = Exclude<{
  [K in keyof T]: T extends Record<K, T[K]>
  ? never
  : K
}[keyof T], undefined>;

/**
 * Get a string type of all the required keys of an interface
 * @template T Any interface
 */
export type RequiredPropertyOf<T> = Exclude<{
  [K in keyof T]: T extends Record<K, T[K]>
  ? K
  : never
}[keyof T], undefined>;

type MergeIfDefined<
  T extends Partial<Record<keyof T, unknown>> | undefined,
  U extends Partial<Record<keyof U, unknown>> | undefined
  > =
  T extends undefined
  ? (
    U extends undefined
    ? undefined
    : U
  )
  : (
    U extends undefined
    ? T
    : T & U
  );

type RefAttributeIfDefined<
  T extends Record<keyof T, unknown> | undefined,
  > = T extends undefined ? undefined : React.RefAttributes<T>;

declare enum PropsKeys {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}

export enum ChildrenType {
  NONE = 'none',
  UNIQUE = 'unique',
  MULTIPLE = 'multiple',
  EXISTS = 'exists',
  STRING = 'string',
  BOOLEAN = 'boolean',
  ALL = 'all',
}

type ComponentProps<
  RequiredProps extends Record<keyof RequiredProps, unknown> | undefined,
  DefaultProps extends Record<keyof DefaultProps, unknown> | undefined,
  OptionalProps extends Record<keyof OptionalProps, unknown> | undefined,
  > = {
    [PropsKeys.INTERNAL]: MergeIfDefined<MergeIfDefined<RequiredProps, Required<DefaultProps>>, Partial<OptionalProps>>;
    [PropsKeys.EXTERNAL]: MergeIfDefined<MergeIfDefined<RequiredProps, Partial<DefaultProps>>, Partial<OptionalProps>>;
  }

type ComponentPropsExternal<
  RequiredProps extends Record<keyof RequiredProps, unknown> | undefined,
  DefaultProps extends Record<keyof DefaultProps, unknown> | undefined,
  OptionalProps extends Record<keyof OptionalProps, unknown> | undefined,
  > = ComponentProps<RequiredProps, DefaultProps, OptionalProps>[PropsKeys.EXTERNAL];

type ComponentPropsInternal<
  RequiredProps extends Record<keyof RequiredProps, unknown> | undefined,
  DefaultProps extends Record<keyof DefaultProps, unknown> | undefined,
  OptionalProps extends Record<keyof OptionalProps, unknown> | undefined,
  > = ComponentProps<RequiredProps, DefaultProps, OptionalProps>[PropsKeys.INTERNAL];

interface ChildrenProps<T extends React.ReactNode> {
  children: T;
}

type PropsWithUniqueChildren<T> = T & ChildrenProps<React.ReactElement>;
type PropsWithMultipleChildren<T> = T & ChildrenProps<React.ReactNodeArray>;
type PropsWithExistsChildren<T> = T & ChildrenProps<React.ReactElement | React.ReactNodeArray>;
type PropsWithBooleanChildren<T> = T & ChildrenProps<boolean>;
type PropsWithStringChildren<T> = T & ChildrenProps<string>;
type PropsWithNoneChildren<T> = T & ChildrenProps<undefined>;

interface BaseCustomFunctionComponent<P, DefaultProps extends keyof P> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (props: P, context?: any): ReactElement<any, any> | null;
  defaultProps?: Partial<Pick<P, Extract<RequiredPropertyOf<P>, DefaultProps>>>;
  propTypes?: WeakValidationMap<P> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contextTypes?: ValidationMap<any> | undefined;
  displayName?: string | undefined;
}

type FunctionsComponent<T, DefaultProps extends keyof T> = {
  [ChildrenType.ALL]: BaseCustomFunctionComponent<React.PropsWithChildren<T>, DefaultProps>;
  [ChildrenType.UNIQUE]: BaseCustomFunctionComponent<PropsWithUniqueChildren<T>, DefaultProps>;
  [ChildrenType.MULTIPLE]: BaseCustomFunctionComponent<PropsWithMultipleChildren<T>, DefaultProps>;
  [ChildrenType.EXISTS]: BaseCustomFunctionComponent<PropsWithExistsChildren<T>, DefaultProps>;
  [ChildrenType.BOOLEAN]: BaseCustomFunctionComponent<PropsWithBooleanChildren<T>, DefaultProps>;
  [ChildrenType.STRING]: BaseCustomFunctionComponent<PropsWithStringChildren<T>, DefaultProps>;
  [ChildrenType.NONE]: BaseCustomFunctionComponent<T, DefaultProps>;
}

type CustomFunctionComponentUgly<
  RequiredProps extends Record<keyof RequiredProps, unknown> | undefined,
  DefaultProps extends Record<keyof DefaultProps, unknown> | undefined,
  OptionalProps extends Record<keyof OptionalProps, unknown> | undefined,
  Ref extends Record<keyof Ref, unknown> | undefined = undefined,
  Children extends ChildrenType = DefaultChildrenType,
  InternalProps extends MergeIfDefined<ComponentPropsInternal<RequiredProps, DefaultProps, OptionalProps>, RefAttributeIfDefined<Ref>> = MergeIfDefined<ComponentPropsInternal<RequiredProps, DefaultProps, OptionalProps>, RefAttributeIfDefined<Ref>>,
  ExternalProps extends MergeIfDefined<ComponentPropsExternal<RequiredProps, DefaultProps, OptionalProps>, RefAttributeIfDefined<Ref>> = MergeIfDefined<ComponentPropsExternal<RequiredProps, DefaultProps, OptionalProps>, RefAttributeIfDefined<Ref>>,
  InternalFunctionComponent extends FunctionsComponent<InternalProps, Extract<keyof InternalProps, keyof DefaultProps>>[Children] = FunctionsComponent<InternalProps, Extract<keyof InternalProps, keyof DefaultProps>>[Children],
  ExternalFunctionComponent extends FunctionsComponent<ExternalProps, Extract<keyof ExternalProps, keyof DefaultProps>>[Children] = FunctionsComponent<ExternalProps, Extract<keyof ExternalProps, keyof DefaultProps>>[Children],
  > = {
    [PropsKeys.INTERNAL]: InternalFunctionComponent;
    [PropsKeys.EXTERNAL]: ExternalFunctionComponent;
  };

type PropsSpliter<
  PropsType,
  DefaultKeys extends undefined | keyof PropsType
  > = PropsType extends undefined
  ? {
    required: undefined;
    default: undefined;
    optional: undefined;
  }
  : {
    required: Pick<PropsType, RequiredPropertyOf<PropsType>>;
    default: [DefaultKeys] extends [keyof PropsType] ? Pick<PropsType, DefaultKeys> : undefined;
    optional: Pick<PropsType, Exclude<OptionalPropertyOf<PropsType>, DefaultKeys>>;
  }

type CustomFunctionComponentBase<
  PropsType,
  DefaultKeys extends (PropsType extends undefined ? undefined : (keyof PropsType | undefined)) = undefined,
  Ref extends Record<keyof Ref, unknown> | undefined = undefined,
  Children extends ChildrenType = DefaultChildrenType,
  SplitProps extends PropsSpliter<PropsType, DefaultKeys> = PropsSpliter<PropsType, DefaultKeys>
  > = CustomFunctionComponentUgly<
    SplitProps['required'],
    SplitProps['default'],
    SplitProps['optional'],
    Ref,
    Children
  >

/**
 * Represent FunctionComponent types.
 *
 * Internal type is used for type props on the component body.
 * External type is used for type the component when it used on JSX.
 * @template PropsType Interface of component props or undefined.
 * @template DefaultKeys String type representing props keys that have a default value or undefined.
 * @template Ref Interface representing ref object of the compoenent or undefined (default: undefined).
 * @template Children ChildrenType who represent the type of the children props (default : ChildrenType.NONE). For VoidFunctionComponent, choose ChildrenType.NONE.
 */
export type CustomFunctionComponent<
  PropsType,
  DefaultKeys extends (PropsType extends undefined ? undefined : (keyof PropsType | undefined)) = undefined,
  Ref extends Record<keyof Ref, unknown> | undefined = undefined,
  Children extends ChildrenType = DefaultChildrenType,
  > = CustomFunctionComponentBase<PropsType, DefaultKeys, Ref, Children>;

export type Internal<T extends { [PropsKeys.INTERNAL]: unknown }> = T[PropsKeys.INTERNAL];
export type External<T extends { [PropsKeys.EXTERNAL]: unknown }> = T[PropsKeys.EXTERNAL];